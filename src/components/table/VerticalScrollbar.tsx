import React, { useEffect, useState } from "react";
import Draggable from "./Draggable";
import { getClassName } from "../../utils";
import { Position, TableApi } from "./Table.types";

export let scrollBlocker = false;

interface VerticalScrollbarProps {
  apiRef: React.MutableRefObject<TableApi<any>>;
  containerRef: React.RefObject<HTMLDivElement>;
  thumbHeight: number;
}

export interface VerticalScrollbarRef {
  updateThumbPosition: () => void;
}

const VerticalScrollbar = React.forwardRef<VerticalScrollbarRef, VerticalScrollbarProps>(
  ({ apiRef, containerRef, thumbHeight }, ref) => {
    const verticalScrollBarRef: React.RefObject<HTMLDivElement> = React.createRef();
    const scrollbarRef: React.RefObject<HTMLDivElement> = React.createRef();
    const [hidden, setHidden] = useState(true);
    const { headerHeight } = apiRef.current;
    const updateThumbPosition = (): void => {
      const scrollThumbStyle = verticalScrollBarRef.current?.style;

      if (scrollThumbStyle != null && !scrollBlocker) {
        scrollThumbStyle.top = `${
          (containerRef.current!.scrollTop /
            (containerRef.current!.scrollHeight - containerRef.current!.clientHeight)) *
          (containerRef.current!.clientHeight - thumbHeight)
        }px`;
      }
    };

    React.useImperativeHandle(ref, () => ({
      updateThumbPosition,
    }));

    const onDrag = (event: PointerEvent, movement: Position): void => {
      event.stopPropagation();
      scrollbarRef.current?.classList.add("rs-active");
      scrollBlocker = true;
      const position = parseFloat(verticalScrollBarRef.current!.style.top) + movement.y;
      const maxHeight = containerRef.current!.clientHeight - thumbHeight;
      verticalScrollBarRef.current!.style.top = `${position < 0 ? 0 : position > maxHeight ? maxHeight : position}px`;

      const scrollPosition =
        (position / maxHeight) * (containerRef.current!.scrollHeight - containerRef.current!.clientHeight);
      containerRef.current?.scrollTo({ top: scrollPosition });
    };

    const onDrop = (): void => {
      scrollbarRef.current?.classList.remove("rs-active");
      scrollBlocker = false;
    };

    const scrollTo = (event: React.PointerEvent<HTMLDivElement>): void => {
      event.stopPropagation();
      const top = containerRef.current?.getBoundingClientRect().top ?? 0;
      const y = event.clientY || event.pageY;
      const scrollPosition =
        ((y - top) / containerRef.current!.clientHeight) *
        (containerRef.current!.scrollHeight - containerRef.current!.clientHeight);
      containerRef.current?.scrollTo({ top: scrollPosition });
      verticalScrollBarRef.current?.dispatchEvent(new Event(event.type, event));
    };

    useEffect(() => {
      if (containerRef.current) {
        setTimeout(() => {
          const contentExceedsView =
            containerRef.current && containerRef.current.scrollHeight > containerRef.current.clientHeight;
          if (hidden && contentExceedsView) {
            setHidden(false);
          } else if (!hidden && !contentExceedsView) {
            setHidden(true);
          }
        });
      }
    });

    return (
      <div
        className={getClassName("scrollbar", "scrollbar-vertical", "animated", hidden && "hidden")}
        ref={scrollbarRef}
        style={{ height: `calc(100% - ${headerHeight}px)`, top: `${headerHeight}px` }}
        onPointerDown={scrollTo}
      >
        <Draggable onDrag={onDrag} onDrop={onDrop} immediate={true} cacheRef={apiRef.current.cacheRef}>
          <div
            className={getClassName("scrollbar-thumb")}
            ref={verticalScrollBarRef}
            style={{ top: "0px", height: `${thumbHeight}px` }}
          />
        </Draggable>
      </div>
    );
  }
);

export default React.memo(VerticalScrollbar);
