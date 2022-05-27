import React from "react";
import {RequiredDefinition, Row} from "../table/Table";
import TableCell from "./TableCell";

export type Primitive = string | number | boolean | undefined;

type TableRowProps = {
  row: Row;
  selectRow: (id: string | number) => void;
  selected: Record<string | number, boolean>;
  rowHeight: number;
  offset: number;
  index: number;
  colDefsRef: React.RefObject<Array<RequiredDefinition>>;
}

const TableRow: React.FC<TableRowProps> = (
  {
    row,
    selectRow,
    selected,
    rowHeight,
    index,
    offset,
    colDefsRef
  }) => {
  return (
    <div
      id={row.id.toString()}
      onClick={() => selectRow(row.id)}
      className={"rs-table-row" + (selected[row.id] ? " rs-selected" : "")}
      style={{transform: `translateY(${rowHeight * (offset + index)}px)`, height: `${rowHeight}px`}}>
      {colDefsRef.current?.map(col => (
          <TableCell key={col.key} col={col} row={row} rowHeight={rowHeight} />
        )
      )}
    </div>
  );
};

export default TableRow;