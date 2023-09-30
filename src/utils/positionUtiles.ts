import React from "react";
import { cacheRef } from "./cacheUtils";
import { Position, RequiredDefinition, Row, TableApi } from "../components";

/**
 * Метод определяет и возвращает новые позиции колонок.
 * @param event для получения информации о перетаскиваемом элементе.
 * @param movement для получения информации о направлении движения.
 * @param tableRef табличный ref.
 * @param colDef перетаскиваемая колонка.
 * @param colDefsRef все колонки.
 * @param apiRef API.
 *
 * @return undefined если ничего не изменилось, или новые colDefs.
 */
export function updateDefsPosition<T extends Row>(
  event: MouseEvent,
  movement: Position,
  tableRef: React.RefObject<HTMLDivElement>,
  colDef: RequiredDefinition<T>,
  colDefsRef: React.RefObject<Array<RequiredDefinition<T>>>,
  apiRef: React.MutableRefObject<TableApi<T>>
): Array<RequiredDefinition<T>> | undefined {
  const { scrollPosition } = apiRef.current;
  const colDefs = colDefsRef.current!;
  const pageX = (event.clientX || event.pageX) + scrollPosition.x;
  const colsWithRef = colDefs.map(col => ({ ...col, ref: cacheRef.headerCells[String(col.key)] }));
  const target = colsWithRef.find(col => col.key === colDef.key);
  let changed = false;

  if (target) {
    const tableLeft = tableRef.current?.getBoundingClientRect().left ?? 0;
    // Вправо.
    while (tableLeft + target.left + target.width < pageX && movement.x > 0) {
      changed = true;
      const next = colsWithRef.find(col => col.index === target.index + 1);
      if (next && next.draggable !== false) {
        const tmp = target.index;
        target.index = next.index;
        next.index = tmp;

        next.left = target.left;
        target.left = next.left + next.width;
      } else {
        break;
      }
    }

    // Влево.
    while (tableLeft + target.left > pageX && movement.x < 0) {
      changed = true;
      const prev = colsWithRef.find(col => col.index === target.index - 1);
      if (prev && prev.draggable !== false) {
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
    // Обновление стилей.
    return colsWithRef.map(({ ref, ...col }) => {
      const headerElement = ref.current;

      if (headerElement) {
        headerElement.style.left = `${col.left}px`;
        headerElement.setAttribute("aria-colindex", col.index.toString());
        Object.keys(cacheRef.cells)
          .filter(key => key.endsWith(String(col.key)))
          .forEach(key => {
            const element = cacheRef.cells[key].current;
            if (element) {
              element.style.left = `${col.left}px`;
              element.setAttribute("aria-colindex", col.index.toString());
            }
          });
      }

      return { ...col };
    });
  }

  return undefined;
}

export const getEventPosition = (event: PointerEvent | React.PointerEvent<HTMLDivElement> | Touch): Position => {
  return { x: event.clientX || event.pageX, y: event.clientY || event.pageY };
};

/**
 * Ловит scroll event'ы и перенаправляет их на другой элемент.
 * @param wrapperRef
 * @param tableRef
 * @param scrollSpeed like native = 1.
 */
export const handleScrollActions = (
  wrapperRef: React.RefObject<HTMLDivElement>,
  tableRef: React.RefObject<HTMLDivElement>,
  scrollSpeed: number
): (() => void) => {
  const wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";
  const listener = (event: Event): void => {
    event.preventDefault();
    const deltaY = (event as WheelEvent).deltaY;
    tableRef.current?.scrollTo({ top: (tableRef.current?.scrollTop ?? 0) + deltaY * scrollSpeed });
  };

  if (wrapperRef.current) {
    wrapperRef.current?.addEventListener("DOMMouseScroll", listener, true);
    wrapperRef.current?.addEventListener(wheelEvent, listener, { capture: true, passive: false });
  }

  return () => {
    wrapperRef.current?.removeEventListener("DOMMouseScroll", listener, true);
    wrapperRef.current?.removeEventListener(wheelEvent, listener, true);
  };
};

const cachedRecord: React.MutableRefObject<null | Record<number, Array<React.RefObject<HTMLDivElement>>>> = {
  current: null,
};

export const resizeColumn = <T extends Row>(
  event: MouseEvent,
  colDef: RequiredDefinition<T>,
  colDefsRef: React.RefObject<Array<RequiredDefinition<T>>>
): void => {
  if (cachedRecord.current === null) {
    cachedRecord.current = Object.values(cacheRef.cells).reduce<Record<number, Array<React.RefObject<HTMLDivElement>>>>(
      (acc, value) => {
        const index = Number(value.current?.getAttribute("aria-colindex"));
        acc[index] = acc[index] ? [...acc[index], value] : [value];
        return acc;
      },
      {}
    );
  }

  const colDefs = colDefsRef.current!;
  const colsWithRef = colDefs.map(col => ({ ...col, ref: cacheRef.headerCells[String(col.key)] }));
  const target = colsWithRef.find(col => col.key === colDef.key);
  let width = Math.round(event.clientX - (target?.ref.current?.getBoundingClientRect().left ?? 0));
  if (width < colDef.minWidth) width = colDef.minWidth;

  if (target?.ref.current && width) {
    target.ref.current.style.width = `${width}px`;

    cachedRecord.current?.[target.index]?.forEach(element => {
      element.current!.style.width = `${width}px`;
    });

    colsWithRef.forEach(value => {
      if (value.index > target.index && !value.fixed) {
        const difference = width - target.width;
        value.ref.current!.classList.remove("rs-animated");
        value.ref.current!.style.left = `${value.left + difference}px`;

        cachedRecord.current?.[value.index]?.forEach(element => {
          element.current!.classList.remove("rs-animated");
          element.current!.style.left = `${value.left + difference}px`;
        });
      }
    });
  }
};

export const applyResize = <T>(apiRef: React.MutableRefObject<TableApi<T>>): void => {
  apiRef.current.colDefsRef.current = apiRef.current.colDefsRef.current.map(value => {
    const width = parseInt(cacheRef.headerCells[String(value.key)].current?.style.width ?? "0");
    const left = parseInt(cacheRef.headerCells[String(value.key)].current?.style.left ?? "0");
    return { ...value, width, left };
  });

  cachedRecord.current = null;
  [...Object.values(cacheRef.headerCells), ...Object.values(cacheRef.cells)].forEach(value => {
    value.current?.classList.add("rs-animated");
  });
  apiRef.current.forceUpdate();
};
