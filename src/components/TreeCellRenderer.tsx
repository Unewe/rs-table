import React, {MutableRefObject} from "react";
import {RequiredDefinition, Row, TableApi} from "../table/Table";
import {Primitive} from "./TableRow";
import Chevron from "./Chevron";

const treeCellRenderer = (row: Row, col: RequiredDefinition, api: MutableRefObject<TableApi>): React.ReactElement => {
  const children = (row[api.current.treeBy!] as Array<unknown> | undefined)?.length;

  return (
    <>
      <div style={{paddingLeft: `${row["_level"] as number}rem`}} onClickCapture={(event) => {
        event.stopPropagation();
        api.current.expandRow(row.id);
      }}>
        {children && <Chevron direction={api.current.expanded[row.id as string] ? "bottom" : "right"}/>}
      </div>
      <div style={{marginLeft: children ? 0 : "30px"}}>{row[col.key] as Primitive}</div>
    </>
  );
};

export default treeCellRenderer;