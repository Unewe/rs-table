import React from "react";
import {Row} from "../table/Table";
import {Primitive} from "./TableRow";
import Chevron from "./Chevron";

type GroupRowProps = {
  row: Row;
  expanded: Record<string | number, boolean>;
  offset: number;
  index: number;
  rowHeight: number;
  expandRow: (id: string | number) => void;
}

const GroupRow: React.FC<GroupRowProps> = ({row, offset, index, rowHeight, expandRow, expanded}): React.ReactElement => {
  return (
    <div
      key={row.id} className={"rs-group-row"}
      style={{transform: `translateY(${rowHeight * (offset + index)}px)`, height: `${rowHeight}px`}}
      onClick={() => expandRow(row.name as string)}>
      <Chevron direction={expanded[row.name as string] ? "bottom" : "right"} />
      <div>{row.name as Primitive} ({row.count as Primitive})</div>
    </div>
  );
};

export default GroupRow;