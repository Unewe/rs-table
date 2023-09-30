import React, { PropsWithChildren } from "react";
import { PointerListener, PointerListenerWithDirection, useDragContext } from "../../hooks/useDragContext";

interface DraggableProps {
  onDrag: PointerListenerWithDirection;
  onDrop?: PointerListener;
  dragId?: string;
  immediate?: boolean;
  cursor?: string;
}

const Draggable: React.FC<PropsWithChildren<DraggableProps>> = ({
  children,
  onDrag,
  onDrop,
  dragId,
  immediate,
  cursor,
}): React.ReactElement => {
  const [onMouseDown] = useDragContext();

  return (
    <>
      {React.Children.map<React.ReactNode, React.ReactNode>(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement, {
              "aria-details": "draggable",
              onPointerDown: (event: PointerEvent) => onMouseDown(event, onDrag, onDrop, dragId, immediate, cursor),
            })
          : null
      )}
    </>
  );
};

export default Draggable;
