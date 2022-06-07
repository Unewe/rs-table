import {RequiredDefinition, Row} from "../table/Table";
import React from "react";
import {cachedCellRefs} from "./cellCacheUtils";
import {Position} from "../hooks/useDragContext";

/**
 * The method checks and returns the new column order.
 * @param event Drag event, to get drag information.
 * @param movement Move direction.
 * @param tableRef Ref of table, to get page offset.
 * @param colDef Dragged column.
 * @param colDefsRef Column definitions.
 * @param rows Rendered rows, to change position with headers.
 *
 * @return undefined if colDefs not changed, or new colDefs.
 */
export const updateDefsPosition = (
  event: MouseEvent,
  movement: Position,
  tableRef: React.RefObject<HTMLDivElement>,
  colDef: RequiredDefinition,
  colDefsRef: React.RefObject<Array<RequiredDefinition>>,
  rows: Array<Row>,
): Array<RequiredDefinition> | undefined => {
  const colDefs = colDefsRef.current!;
  const pageX = event.clientX || event.pageX;
  const colsWithRef = colDefs.map(col => ({...col, ref: cachedCellRefs[`header_${col.key}`]}));
  const target = colsWithRef.find(col => col.key === colDef.key);
  let changed = false;

  if (target) {
    const tableLeft = tableRef.current?.getBoundingClientRect().left ?? 0;
    // Move right.
    while (tableLeft + target.left + target.width < pageX && movement.x > 0) {
      changed = true;
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
    while (pageX && (tableLeft + target.left) > pageX && movement.x < 0) {
      changed = true;
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

  if (changed) {
    // Update style.
    return colsWithRef.map(({ref, ...col}) => {
      const headerElement = ref.current;

      if (headerElement) {
        headerElement.style.left = `${col.left}px`;
        headerElement.setAttribute("aria-colindex", col.index.toString());
        rows.forEach(row => {
          const element = cachedCellRefs[`${row.id}_${col.key}`]?.current;
          if (element) {
            element.style.left = `${col.left}px`;
            element.setAttribute("aria-colindex", col.index.toString());
          }
        });
      }

      return {...col};
    });
  }

  return undefined;
}

export const getEventPosition = (event: PointerEvent | React.PointerEvent<HTMLDivElement> | Touch): Position => {
  return {x: event.clientX || event.pageX, y: event.clientY || event.pageY};
}

const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
/**
 * Catch scrollEvents and redirect to another Element.
 * TODO touch event!
 * @param wrapperRef
 * @param tableRef
 * @param scrollSpeed like native = 1.
 */
export const handleScrollActions = (
  wrapperRef: React.RefObject<HTMLDivElement>,
  tableRef: React.RefObject<HTMLDivElement>,
  scrollSpeed: number) => {
  const listener = (event: Event) => {
    event.preventDefault();
    const deltaY = (event as WheelEvent).deltaY;
    tableRef.current?.scrollTo({top: (tableRef.current?.scrollTop ?? 0) + deltaY * scrollSpeed});
  };

  if (wrapperRef.current) {
    wrapperRef.current?.addEventListener("DOMMouseScroll", listener, true);
    wrapperRef.current?.addEventListener(wheelEvent, listener, {capture: true, passive: false});
    wrapperRef.current?.addEventListener("touchmove", listener, {capture: true, passive: false});
    wrapperRef.current?.addEventListener("keydown", listener, true);
  }

  return () => {
    wrapperRef.current?.removeEventListener("DOMMouseScroll", listener, true);
    wrapperRef.current?.removeEventListener(wheelEvent, listener, true);
    wrapperRef.current?.removeEventListener("touchmove", listener, true);
    wrapperRef.current?.removeEventListener("keydown", listener, true);
  };
}