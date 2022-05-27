import React, {PropsWithChildren} from "react";
import {useDragContext} from "../hooks/useDragContext";

const Draggable: React.FC<PropsWithChildren<{ onDrag: (e: MouseEvent) => void, dragId?: string }>> = (
  {
    children,
    onDrag,
    dragId,
  }): React.ReactElement => {
  const [onMouseDown] = useDragContext();

  return (
    <>
      {React.Children.map(children, child => React.isValidElement(child)
        ? React.cloneElement(child, {
          "aria-details": "draggable",
          onMouseDown: (event: MouseEvent) => onMouseDown(event, onDrag, dragId),
        })
        : null)}
    </>
  );
}

export default Draggable;