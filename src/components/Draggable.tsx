import React, {PropsWithChildren} from "react";
import {PointerListener, PointerListenerWithDirection, useDragContext} from "../hooks/useDragContext";

type DraggableProps = {
  onDrag: PointerListenerWithDirection,
  onDrop?: PointerListener,
  dragId?: string,
  immediate?: boolean
}

const Draggable: React.FC<PropsWithChildren<DraggableProps>> = (
  {
    children,
    onDrag,
    onDrop,
    dragId,
    immediate
  }): React.ReactElement => {
  const [onMouseDown] = useDragContext();

  return (
    <>
      {React.Children.map(children, child => React.isValidElement(child)
        ? React.cloneElement(child, {
          "aria-details": "draggable",
          onPointerDownCapture: (event: PointerEvent) => onMouseDown(event, onDrag, onDrop, dragId, immediate),
        })
        : null)}
    </>
  );
}

export default Draggable;