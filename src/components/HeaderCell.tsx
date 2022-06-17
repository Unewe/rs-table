import React from "react";
import {getCellRef} from "../utils/cellCacheUtils";
import {RequiredDefinition, Sort} from "../table/Table";
import {Arrow} from "./Arrow";

type HeaderRowProps = {
  col: RequiredDefinition;
  headerHeight: number;
  sort?: Sort;
  setSort: React.Dispatch<React.SetStateAction<Sort | undefined>>;
}

const HeaderCell: React.FC<HeaderRowProps> = ({headerHeight, col, sort, setSort, ...props}): React.ReactElement => {
  return (
    <div ref={getCellRef(`header_${col.key}`)}
         {...props}
         aria-colindex={col.index}
         onPointerUp={() => {
           setSort(prevState => {
             if (prevState?.key === col.key && prevState.direction === "desc") {
               return undefined;
             } else {
               return {
                 key: col.key,
                 direction: prevState?.key === col.key && prevState.direction === "asc" ? "desc" : "asc",
                 function: col.sort,
               };
             }
           })
         }}
         className={"rs-header-cell rs-animated"}
         style={{
           left: `${col.left}px`,
           minWidth: `${col.minWidth}px`,
           width: `${col.width}px`,
           height: `${headerHeight}px`
         }}>
      {col.headerRenderer ? col.headerRenderer() : col.name}
      {col.key === sort?.key && <Arrow direction={sort.direction === "asc" ? "bottom" : "top"} />}
    </div>
  );
};

export default HeaderCell;