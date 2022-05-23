import {RequiredDefinition, Row} from "../table/Table";
import React from "react";
import {cachedCellRefs} from "./cellCacheUtils";

/**
 * The method checks and returns the new column order.
 * @param event Drag event, to get drag information.
 * @param tableRef Ref таблицы.
 * @param colDef Dragged column.
 * @param colDefsRef Column definitions.
 *
 * @return undefined if colDefs not changed, or new colDefs.
 */
export const updateDefsPosition = (
  event: React.DragEvent<HTMLDivElement>,
  tableRef: React.RefObject<HTMLDivElement>,
  colDef: RequiredDefinition,
  colDefsRef: React.RefObject<Array<RequiredDefinition>>,
  rows: Array<Row>,
): Array<RequiredDefinition> | undefined => {
  const colDefs = colDefsRef.current!;

  const colsWithRef = colDefs.map(col => ({...col, ref: cachedCellRefs[`header_${col.key}`]}));
  const target = colsWithRef.find(col => col.key === colDef.key);

  if (target) {
    const tableLeft = tableRef.current?.getBoundingClientRect().left ?? 0;
    // Move right.
    while (tableLeft + target.left + target.width < event.pageX) {
      const next = colsWithRef.find(col => col.index === target.index + 1);
      if (next) {
        const tmp = target.index;
        target.index = next.index;
        next.index = tmp;

        next.left = target.left;
        target.left = next.left + next.width;
      } else {
        break;
      }
    }
    // Move left.
    while (event.pageX && (tableLeft + target.left) > event.pageX) {
      const prev = colsWithRef.find(col => col.index === target.index - 1);
      if (prev) {
        const tmp = target.index;
        target.index = prev.index;
        prev.index = tmp;

        target.left = prev.left;
        prev.left = target.left + target.width;
      } else {
        break;
      }
    }
  }
  // Update style.
  return colsWithRef.map(({ref, ...col}) => {
    const style = ref.current?.style;

    if (style) {
      style.left = `${col.left}px`;
      rows.forEach(row => {
        const cellStyle = cachedCellRefs[`${row.id}_${col.key}`].current?.style;
        if (cellStyle) {
          cellStyle.left = `${col.left}px`;
        }
      })
    }

    return {...col};
  });
}