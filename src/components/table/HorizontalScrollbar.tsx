import React, { useEffect, useState } from "react";
import { cacheRef, getClassName } from "../../utils";
import Draggable from "./Draggable";
import { Position, RequiredDefinition, TableApi } from "./Table.types";

const scrollbarRef = React.createRef<HTMLDivElement>();
const horizontalScrollBarRef = React.createRef<HTMLDivElement>();

interface HorizontalScrollbarProps {
  apiRef: React.MutableRefObject<TableApi<any>>;
  colDefsRef: React.RefObject<Array<RequiredDefinition<any>>>;
  containerRef: React.RefObject<HTMLDivElement>;
  thumbWidth: number;
}

export const HorizontalScrollbar: React.FC<HorizontalScrollbarProps> = ({
  containerRef,
  thumbWidth,
  colDefsRef,
  apiRef,
}) => {
  const { scrollPosition, width, wrapperRef } = apiRef.current;
  const [hidden, setHidden] = useState(true);
  const cachedCells = React.useRef<Array<React.RefObject<HTMLDivElement>> | undefined>(undefined);

  const initCache = (): void => {
    const fixedColumns = colDefsRef.current?.filter(value => value.fixed).map(value => value.key) ?? [];
    if (cachedCells.current === undefined) {
      const headerCells = Object.keys(cacheRef.headerCells)
        .filter(cell => !fixedColumns.includes(cell))
        .map(key => cacheRef.headerCells[key]);
      const tableCells = Object.keys(cacheRef.cells)
        .filter(cell => !fixedColumns.some(column => cell.endsWith(String(column))))
        .map(key => cacheRef.cells[key]);

      cachedCells.current = [...headerCells, ...tableCells];
    }
  };

  const clearCache = (): void => {
    cachedCells.current = undefined;
  };

  React.useEffect(() => {
    clearCache();
  }, [apiRef.current, cacheRef.headerCells, cacheRef.cells]);

  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        const contentExceedsView = containerRef.current && width > containerRef.current.clientWidth;
        if (hidden && contentExceedsView) {
          setHidden(false);
        } else if (!hidden && !contentExceedsView) {
          setHidden(true);
        }
      });
    }
  });

  const moveTo = (position: number): void => {
    if (scrollPosition.x === 0) {
      wrapperRef.current?.classList.add(getClassName("pinned-left"));
    } else {
      wrapperRef.current?.classList.remove(getClassName("pinned-left"));
    }

    if (scrollPosition.x > width - containerRef.current!.clientWidth - 1) {
      wrapperRef.current?.classList.add(getClassName("pinned-right"));
    } else {
      wrapperRef.current?.classList.remove(getClassName("pinned-right"));
    }

    cachedCells.current?.forEach(value => {
      if (value.current) {
        value.current.style.transform = `translateX(${-position}px)`;
      }
    });
  };

  const scrollTo = (event: React.PointerEvent<HTMLDivElement>): void => {
    initCache();
    event.stopPropagation();
    const left = containerRef.current?.getBoundingClientRect().left ?? 0;
    const x = event.clientX || event.pageX;
    const clientWidth = containerRef.current!.clientWidth;
    const clickPosition = (x - left) / clientWidth;
    const thumbPosition = clickPosition * (clientWidth - thumbWidth);
    horizontalScrollBarRef.current!.style.left = `${thumbPosition}px`;
    scrollPosition.x = clickPosition * (width - containerRef.current!.clientWidth);

    moveTo(scrollPosition.x);
    clearCache();
  };

  const onDrag = (event: PointerEvent, movement: Position): void => {
    initCache(); // Что-бы каждый раз не определять колонки для перемещения.
    event.stopPropagation();
    scrollbarRef.current?.classList.add("rs-active");
    const position = parseFloat(horizontalScrollBarRef.current!.style.left) + movement.x;
    const maxWidth = containerRef.current!.clientWidth - thumbWidth;
    horizontalScrollBarRef.current!.style.left = `${position < 0 ? 0 : position > maxWidth ? maxWidth : position}px`;
    let value = position / maxWidth;
    if (value < 0) value = 0;
    if (value > 1) value = 1;

    scrollPosition.x = value * (width - containerRef.current!.clientWidth);

    moveTo(scrollPosition.x);
  };

  const onDrop = (): void => {
    scrollbarRef.current?.classList.remove("rs-active");
    clearCache();
  };

  return (
    <div
      className={getClassName("scrollbar", "scrollbar-horizontal", "animated", hidden && "hidden")}
      ref={scrollbarRef}
      onPointerDown={scrollTo}
    >
      <Draggable onDrag={onDrag} onDrop={onDrop} immediate={true}>
        <div
          className={getClassName("scrollbar-thumb")}
          ref={horizontalScrollBarRef}
          style={{ left: "0px", width: `${thumbWidth}px` }}
        />
      </Draggable>
    </div>
  );
};
