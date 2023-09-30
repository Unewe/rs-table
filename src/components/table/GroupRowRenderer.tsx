import React, { useMemo } from "react";
import { Row, TableApi, TechRow } from "./Table.types";
import { getClassName } from "../../utils";
import { defaultGroupRowRenderer } from "./Renderers";

interface GroupRowProps<T> {
  row: TechRow<T>;
  offset: number;
  index: number;
  apiRef: React.MutableRefObject<TableApi<T>>;
}

const GroupRowRenderer = <T extends Row>({ row, offset, index, apiRef }: GroupRowProps<T>): React.ReactElement => {
  const { rowHeight, grouped, selected, groupRowRenderer } = apiRef.current;
  const groupRows = grouped[row.$name ?? ""];
  const allRowsSelected = useMemo(() => groupRows?.every(({ id }) => selected[id]), [selected, grouped]);

  return (
    <div
      key={row.id}
      className={getClassName("group-row", allRowsSelected && "selected")}
      style={{ transform: `translateY(${rowHeight * (offset + index)}px)`, height: `${rowHeight}px` }}
    >
      {groupRowRenderer?.(row, apiRef) ?? defaultGroupRowRenderer(row, apiRef)}
    </div>
  );
};

export default GroupRowRenderer;
