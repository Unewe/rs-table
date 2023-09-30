import React from "react";
import TableCell from "./TableCell";
import { RequiredDefinition, Row, TableApi, TechRow } from "./Table.types";

export type Primitive = string | number | boolean | undefined;

interface TableRowProps<T extends Row> {
  row: T | TechRow<T>;
  offset: number;
  index: number;
  colDefsRef: React.RefObject<Array<RequiredDefinition<T>>>;
  apiRef: React.MutableRefObject<TableApi<T>>;
}

const TableRowRenderer = <T extends Row>({
  row,
  index,
  offset,
  colDefsRef,
  apiRef,
}: TableRowProps<T>): React.ReactElement => {
  const { rowHeight, selectionType, treeBy, selectRow, selected } = apiRef.current;
  const clickHandler = selectionType === "single" || treeBy ? () => selectRow(row.id) : undefined;
  return (
    <div
      id={row.id.toString()}
      onClick={clickHandler}
      className={"rs-table-row" + (selected[row.id] ? " rs-selected" : "")}
      style={{ transform: `translateY(${rowHeight * (offset + index)}px)`, height: `${rowHeight}px` }}
    >
      {colDefsRef.current?.map(col => (
        <TableCell key={String(col.key)} col={col} row={row} apiRef={apiRef} />
      ))}
    </div>
  );
};

export default TableRowRenderer;
