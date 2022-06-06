import React from "react";
import Draggable from "./Draggable";
import {Position} from "../hooks/useDragContext";

export const verticalScrollBarRef: React.RefObject<HTMLDivElement> = React.createRef();
const scrollbarRef: React.RefObject<HTMLDivElement> = React.createRef();
export let scrollBlocker = false;

type VerticalScrollbarProps = { headerHeight: number, containerRef: React.RefObject<HTMLDivElement>, thumbHeight: number };

export const VerticalScrollbar: React.FC<VerticalScrollbarProps> = React.memo(({
                                                                                 headerHeight,
                                                                                 containerRef,
                                                                                 thumbHeight
                                                                               }) => {
  const onDrag = (event: PointerEvent, movement: Position) => {
    event.stopPropagation();
    scrollbarRef.current?.classList.add("rs-active");
    scrollBlocker = true;
    const position = parseFloat(verticalScrollBarRef.current!.style.top) + movement.y;
    const maxHeight = (containerRef.current!.clientHeight - thumbHeight);
    verticalScrollBarRef.current!.style.top = `${position < 0 ? 0 : position > maxHeight ? maxHeight : position}px`;

    const scrollPosition = position / maxHeight * (containerRef.current!.scrollHeight - containerRef.current!.clientHeight);
    containerRef.current?.scrollTo({top: scrollPosition});
  };

  const onDrop = () => {
    scrollbarRef.current?.classList.remove("rs-active");
    scrollBlocker = false;
  }

  const scrollTo = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const top = containerRef.current?.getBoundingClientRect().top ?? 0;
    const y = event.clientY || event.pageY;
    const scrollPosition = (y - top) / (containerRef.current!.clientHeight) * (containerRef.current!.scrollHeight - containerRef.current!.clientHeight);
    containerRef.current?.scrollTo({top: scrollPosition});
    verticalScrollBarRef.current?.dispatchEvent(new Event(event.type, event));
  }

  return (
    <div className={"rs-scrollbar-vertical rs-animated"}
         ref={scrollbarRef}
         style={{height: `calc(100% - ${headerHeight}px)`, top: `${headerHeight}px`}}
         onPointerDown={scrollTo}>
      <Draggable onDrag={onDrag} onDrop={onDrop} immediate={true}>
        <div className={"rs-scrollbar-thumb"} ref={verticalScrollBarRef}
             style={{top: "0px", height: `${thumbHeight}px`}}/>
      </Draggable>
    </div>
  );
});
