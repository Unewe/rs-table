import React from "react";
import {getCellRef} from "../utils/cellCacheUtils";
import {RequiredDefinition} from "../table/Table";

type HeaderRowProps = {
  col: RequiredDefinition;
  headerHeight: number;
}

const HeaderCell: React.FC<HeaderRowProps> = ({headerHeight, col, ...props}): React.ReactElement => {
  return (
    <div ref={getCellRef(`header_${col.key}`)}
         {...props}
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
  );
};

export default HeaderCell;