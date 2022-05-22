import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import "../style/index.scss";
import useParseData from "../hooks/useParseData";
import {cachedCellRefs, getCellRef} from "../utils/cellCacheUtils";

type Primitive = string | number | boolean | undefined;

export type ColumnDefinition = {
  name: string;
  key: string;
  sortable?: boolean;
  draggable?: boolean;
  fixed?: "left" | "right";
  sort?: "asc" | "desc";
  group?: boolean;
  tree?: boolean;
  renderer?: (value: Row) => React.ReactElement;
  headerRenderer?: () => React.ReactElement;
  minWidth?: number;
  width?: number;
  left?: number;
  index?: number;
}

export type Row = Record<"id", string | number> & Record<string, unknown>;

type TableProps = {
  data: Array<Row>;
  colDefs: Array<ColumnDefinition>;
  onSelect: (values: Array<Row>) => void;
  rowHeight?: number;
  headerHeight?: number;
  onDragEnd?: () => {};
  select?: () => {};
  onExpand?: () => {};
  virtual?: boolean;
}

// type TableApi = {
//   expanded: Array<string | number>;
//   selected: Array<string | number>;
//   toggle: (row: Row) => void;
//   select: (row: Row) => void;
// }

const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_HEADER_HEIGHT = 45;
const MIN_WIDTH = 40;

const Table: React.FC<TableProps> = (
  {
    data,
    colDefs,
    rowHeight = DEFAULT_ROW_HEIGHT,
    headerHeight = DEFAULT_HEADER_HEIGHT
  }
): React.ReactElement => {
  const [expanded,] = useState<Record<string | number, boolean>>({});
  const [selected, setSelected] = useState<Record<string | number, boolean>>({});
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [capacity, setCapacity] = useState(0);
  const colDefsRef = useRef<Array<ColumnDefinition>>(colDefs);

  const edge = useMemo(() => {
    return capacity + offset;
  }, [capacity, offset]);

  const [visibleRows] = useParseData(data, expanded, "", "");

  const selectRow = useCallback((id: number | string) => {
    setSelected((selected) => {
      if (selected[id]) {
        const tmp = {...selected};
        delete tmp[id];
        return tmp;
      } else {
        selected[id] = true;
        return {...selected, [id]: true};
      }
    });
  }, []);

  useEffect(() => {
    if (tableRef.current?.clientHeight) {
      const changedCapacity = tableRef.current.clientHeight / rowHeight * 4;
      capacity !== changedCapacity && setCapacity(changedCapacity)
    }
  }, [tableRef.current?.clientHeight]);

  useEffect(() => {
    if (tableRef.current) {
      const withWidth = colDefs.filter(value => value.width);
      const fixedWidth = withWidth.reduce((acc, value) => acc + value.width!, 0);
      const flexWidth = (tableRef.current!.clientWidth - fixedWidth) / (colDefs.length - withWidth.length);

      colDefsRef.current = colDefs.reduce((acc: Array<ColumnDefinition>, value, index) => {
        const left = index === 0
          ? 0
          : (acc[index - 1].left || 0) + (acc[index - 1].width || flexWidth > 0 ? flexWidth : MIN_WIDTH);
        acc[index] = {...value, left, width: value.width || flexWidth, minWidth: value.minWidth || MIN_WIDTH}
        return acc;
      }, []);
    }
  }, [tableRef.current?.clientWidth]);

  const containerHeight = visibleRows.length * rowHeight;

  const onScroll = () => {
    const tmp = Math.round(tableRef.current!.scrollTop / rowHeight);
    const nexOffset = Math.round(tmp - capacity / 3);

    if (tmp >= offset + capacity * 0.63) {
      setOffset(nexOffset < 0 ? 0 : nexOffset);
    } else if (offset && tmp <= offset + capacity * 0.1) {
      setOffset(nexOffset < 0 ? 0 : nexOffset);
    } else if (tmp === 0) {
      setOffset(0);
    }
  };

  const handleDrag = useCallback((event: React.DragEvent<HTMLDivElement>, colDef: ColumnDefinition) => {
    const right = getCellRef(`header_${colDef.key}`).current?.getBoundingClientRect().right;

    if (right && event.pageX > right) {
      const targetRefs = visibleRows.slice(offset, edge)
        .map(row => {
          return [
            cachedCellRefs[`header_${colDef.key}`],
            ...colDefs.filter(col => col.key === colDef.key).map(col => cachedCellRefs[`${row.id}_${col.key}`])
          ];
        }).flat();

      targetRefs.forEach(ref => {
        const cellStyle = ref.current?.style;
        if (cellStyle) {
          cellStyle.left = `${parseInt(cellStyle.left) + 30}px`;
        }
      });
    }
  }, [offset, edge])

  const virtualRows = useMemo(() => {
    return visibleRows.slice(offset, edge).map((value, index) => (
      <div
        id={value.id.toString()} key={value.id}
        onClick={() => selectRow(value.id)}
        className={"rs-table-row" + (selected[value.id] ? " rs-selected" : "")}
        style={{transform: `translateY(${rowHeight * (offset + index)}px)`, height: `${rowHeight}px`}}>
        {colDefsRef.current.map(col => (
            <div key={col.key} className={"rs-table-cell rs-animated"}
                 ref={getCellRef(`${value.id}_${col.key}`)}
                 style={{
                   left: `${col.left}px`,
                   minWidth: `${col.minWidth}px`,
                   width: `${col.width}px`,
                   height: `${rowHeight}px`
                 }}>
              {col.renderer ? col.renderer(value) : value[col.key] as Primitive}
            </div>
          )
        )}
      </div>
    ));
  }, [visibleRows, offset, edge, selected]);

  const headers = useMemo(() => (
    <div className={"rs-header-wrapper"} style={{height: headerHeight + "px"}}>
      {colDefsRef.current.map(col => (
        <div draggable
             onDrag={(event) => handleDrag(event, col)} key={col.key}
             ref={getCellRef(`header_${col.key}`)}
             className={"rs-header-cell"}
             style={{
               left: `${col.left}px`,
               minWidth: `${col.minWidth}px`,
               width: `${col.width}px`,
               height: `${headerHeight}px`
             }}>
          {col.headerRenderer ? col.headerRenderer() : col.name}
        </div>
      ))}
    </div>
  ), [colDefsRef.current]);

  return (
    <div style={{height: "100%"}}>
      {headers}
      <div ref={tableRef} className={"rs-table-wrapper"}
           style={{maxHeight: "100%", width: "100%"}}
           onScroll={onScroll}>
        <div className={"rs-table-container"} style={{height: containerHeight + "px"}}>
          {virtualRows}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Table);
