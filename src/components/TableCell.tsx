import React from "react";
import {getCellRef} from "../utils/cellCacheUtils";
import {RequiredDefinition, Row} from "../table/Table";
import {Primitive} from "./TableRow";

type TableCellProps = {
  col: RequiredDefinition;
  row: Row;
  rowHeight: number;
}

const TableCell: React.FC<TableCellProps> = ({col, row, rowHeight}): React.ReactElement => {
  return (
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
  );
};

export default TableCell;