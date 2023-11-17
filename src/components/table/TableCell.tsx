import React from "react";
import { getCellRef, getClassName } from "../../utils";
import { RequiredDefinition, Row, TableApi } from "./Table.types";

interface TableCellProps {
  col: RequiredDefinition<any>;
  row: Row;
  apiRef: React.MutableRefObject<TableApi<any>>;
}

const cellClassName = getClassName("table-cell", "animated");

const TableCell: React.FC<TableCellProps> = ({ col, row, apiRef }): React.ReactElement => {
  const { scrollPosition } = apiRef.current;
  return (
    <div
      key={col.key.toString()}
      className={cellClassName}
      ref={getCellRef(apiRef.current.cacheRef, `${row.id.toString()}_${col.key.toString()}`)}
      aria-colindex={col.index}
      style={{
        left: `${col.left}px`,
        minWidth: `${col.minWidth}px`,
        width: `${col.width}px`,
        transform: col.fixed ? "unset" : `translateX(${-scrollPosition.x}px)`,
        zIndex: col.fixed ? 10 : "unset",
      }}
    >
      {col.renderer(col, row, apiRef)}
    </div>
  );
};

export default TableCell;
