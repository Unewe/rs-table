import React from "react";
import {RequiredDefinition, Row, TableApi} from "../table/Table";
import TableCell from "./TableCell";

export type Primitive = string | number | boolean | undefined;

type TableRowProps = {
  row: Row;
  rowHeight: number;
  offset: number;
  index: number;
  colDefsRef: React.RefObject<Array<RequiredDefinition>>;
  treeBy?: string;
  api: React.MutableRefObject<TableApi>;
}

const TableRow: React.FC<TableRowProps> = (
  {
    row,
    rowHeight,
    index,
    offset,
    colDefsRef,
    api
  }) => {
  return (
    <div
      id={row.id.toString()}
      onClick={() => api.current.selectRow(row.id)}
      className={"rs-table-row" + (api.current.selected[row.id] ? " rs-selected" : "")}
      style={{transform: `translateY(${rowHeight * (offset + index)}px)`, height: `${rowHeight}px`}}>
      {colDefsRef.current?.map(col => (
          <TableCell key={col.key} col={col} row={row} rowHeight={rowHeight} api={api}/>
        )
      )}
    </div>
  );
};

export default TableRow;