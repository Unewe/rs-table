import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import "../style/index.scss";
import useParseData from "../hooks/useParseData";
import {getCellRef} from "../utils/cellCacheUtils";
import {updateDefsPosition} from "../utils/cellPositionUtiles";
import Draggable from "../components/Draggable";

type Primitive = string | number | boolean | undefined;

type Definition = {
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
}

type ExtraDefinition = {
  minWidth?: number;
  width?: number;
  left?: number;
  index?: number;
}

export type ColumnDefinition = Definition & ExtraDefinition;
export type RequiredDefinition = Definition & Required<ExtraDefinition>;

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
  const colDefsRef = useRef<Array<RequiredDefinition>>([]);

  const edge = useMemo(() => {
    return capacity + offset;
  }, [capacity, offset]);

  const [visibleRows] = useParseData(data, expanded, "", "");
  const virtualRows = useMemo(() => visibleRows.slice(offset, edge), [visibleRows, offset, edge]);

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

      colDefsRef.current = colDefs.reduce((acc: Array<RequiredDefinition>, value, index) => {
        const left = index === 0
          ? 0
          : (acc[index - 1].left || 0)
          + (acc[index - 1].width || flexWidth > 0
            ? acc[index - 1].width || flexWidth
            : MIN_WIDTH);
        acc[index] = {...value, left, width: value.width || flexWidth, minWidth: value.minWidth || MIN_WIDTH, index}
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

  const handleDrag = useCallback((event: MouseEvent, colDef: RequiredDefinition, rows: Array<Row>) => {
    const newColRefs = updateDefsPosition(event, tableRef, colDef, colDefsRef, rows);

    if (newColRefs) {
      colDefsRef.current = newColRefs;
    }
  }, []);

  // TODO optimisation with React.cloneElement or smth. else.
  const tableRows = useMemo(() => {
    return virtualRows.map((row, index) => (
      <div
        id={row.id.toString()} key={row.id}
        onClick={() => selectRow(row.id)}
        className={"rs-table-row" + (selected[row.id] ? " rs-selected" : "")}
        style={{transform: `translateY(${rowHeight * (offset + index)}px)`, height: `${rowHeight}px`}}>
        {colDefsRef.current.map(col => (
            <div key={col.key} className={"rs-table-cell rs-animated"}
                 ref={getCellRef(`${row.id}_${col.key}`)}
                 aria-colindex={col.index}
                 style={{
                   left: `${col.left}px`,
                   minWidth: `${col.minWidth}px`,
                   width: `${col.width}px`,
                   height: `${rowHeight}px`
                 }}>
              {col.renderer ? col.renderer(row) : row[col.key] as Primitive}
            </div>
          )
        )}
      </div>
    ));
  }, [virtualRows, offset, edge, selected]);

  // TODO optimisation with React.cloneElement or smth. else.
  const tableHeaders = useMemo(() => (
    <div className={"rs-header-wrapper"} style={{height: headerHeight + "px"}}>
      {colDefsRef.current.map(col => (
        <Draggable key={col.key} onDrag={(event) => handleDrag(event, col, virtualRows)}>
          <div ref={getCellRef(`header_${col.key}`)}
               aria-colindex={col.index}
               className={"rs-header-cell rs-animated"}
               style={{
                 left: `${col.left}px`,
                 minWidth: `${col.minWidth}px`,
                 width: `${col.width}px`,
                 height: `${headerHeight}px`
               }}>
            {col.headerRenderer ? col.headerRenderer() : col.name}
          </div>
        </Draggable>
      ))}
    </div>
  ), [colDefsRef.current, virtualRows]);

  return (
    <div style={{height: "100%"}} className={"rs-wrapper"}>
      {tableHeaders}
      <div ref={tableRef} className={"rs-table-wrapper"}
           style={{maxHeight: "100%", maxWidth: "100%", width: "100%"}}
           onScroll={onScroll}>
        <div className={"rs-table-container"} style={{height: containerHeight + "px"}}>
          {tableRows}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Table);
