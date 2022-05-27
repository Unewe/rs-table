import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import "../style/index.scss";
import useParseData from "../hooks/useParseData";
import {updateDefsPosition} from "../utils/cellPositionUtiles";
import Draggable from "../components/Draggable";
import TableRow from "../components/TableRow";
import HeaderCell from "../components/HeaderCell";
import GroupRow from "../components/GroupRow";

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
  groupBy?: string;
}

const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_HEADER_HEIGHT = 45;
const MIN_WIDTH = 40;

const Table: React.FC<TableProps> = (
  {
    data,
    colDefs,
    rowHeight = DEFAULT_ROW_HEIGHT,
    headerHeight = DEFAULT_HEADER_HEIGHT,
    groupBy
  }
): React.ReactElement => {
  const [expanded, setExpanded] = useState<Record<string | number, boolean>>({});
  const [selected, setSelected] = useState<Record<string | number, boolean>>({});
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [capacity, setCapacity] = useState(0);
  const colDefsRef = useRef<Array<RequiredDefinition>>([]);

  const edge = useMemo(() => {
    return capacity + offset;
  }, [capacity, offset]);

  const [visibleRows] = useParseData(data, expanded, groupBy, "");
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

  const expandRow = useCallback((id: string | number) => {
    setExpanded((expanded) => {
      if (expanded[id]) {
        const tmp = {...expanded};
        delete tmp[id];
        return tmp;
      } else {
        expanded[id] = true;
        return {...expanded, [id]: true};
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

  const handleDrag = useCallback((event: MouseEvent, colDef: RequiredDefinition, rows: Array<Row>): void => {
    const newColRefs = updateDefsPosition(event, tableRef, colDef, colDefsRef, rows);

    if (newColRefs) {
      colDefsRef.current = newColRefs;
    }
  }, []);

  const tableRows = useMemo(() => {
    return virtualRows.map((row, index) => (
      row.type === "_GroupRow"
        ? <GroupRow
          key={row.id}
          offset={offset}
          index={index}
          row={row}
          expanded={expanded}
          rowHeight={rowHeight}
          expandRow={expandRow}/>
        : <TableRow
          key={row.id}
          row={row}
          selectRow={selectRow}
          selected={selected}
          rowHeight={rowHeight}
          offset={offset}
          index={index}
          colDefsRef={colDefsRef}/>
    ));
  }, [virtualRows, offset, edge, selected]);

  const tableHeaders = useMemo(() => (
    <div className={"rs-header-wrapper"} style={{height: headerHeight + "px"}}>
      {colDefsRef.current.map(col => (
        <Draggable key={col.key} dragId={`header_${col.key}`} onDrag={(event) => handleDrag(event, col, virtualRows)}>
          <HeaderCell col={col} headerHeight={headerHeight}/>
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
