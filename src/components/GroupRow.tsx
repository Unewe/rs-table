import React from "react";
import {Row} from "../table/Table";
import {Primitive} from "./TableRow";

type GroupRowProps = {
  row: Row;
  expanded: Record<string | number, boolean>;
  offset: number;
  index: number;
  rowHeight: number;
  expandRow: (id: string | number) => void;
}

const GroupRow: React.FC<GroupRowProps> = ({row, offset, index, rowHeight, expandRow}): React.ReactElement => {
  return (
    <div
      key={row.id} className={"rs-group-row"}
      style={{transform: `translateY(${rowHeight * (offset + index)}px)`, height: `${rowHeight}px`}}
      onClick={() => expandRow(row.name as string)}>
      <div>{row.name as Primitive}</div>
      <div>({row.count as Primitive})</div>
    </div>
  );
};

export default GroupRow;