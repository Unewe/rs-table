import React from "react";
import {getCellRef} from "../utils/cellCacheUtils";
import {RequiredDefinition, Row, TableApi} from "../table/Table";
import {Primitive} from "./TableRow";
import treeCellRenderer from "./TreeCellRenderer";

type TableCellProps = {
  col: RequiredDefinition;
  row: Row;
  rowHeight: number;
  api: React.MutableRefObject<TableApi>;
}

const TableCell: React.FC<TableCellProps> = ({col, row, rowHeight, api}): React.ReactElement => {
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
      {col.renderer ? col.renderer(row, api) : api.current.treeBy && col.tree ? treeCellRenderer(row, col, api) : row[col.key] as Primitive}
    </div>
  );
};

export default TableCell;