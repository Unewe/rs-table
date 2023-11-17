import React, { PropsWithChildren } from "react";
import { PointerListener, PointerListenerWithDirection, useDragContext } from "../../hooks/useDragContext";
import {TableCache} from "../../utils/cacheUtils";

interface DraggableProps {
  onDrag: PointerListenerWithDirection;
  onDrop?: PointerListener;
  dragId?: string;
  immediate?: boolean;
  cursor?: string;
  cacheRef: TableCache;
}

const Draggable: React.FC<PropsWithChildren<DraggableProps>> = ({
  children,
  onDrag,
  onDrop,
  dragId,
  immediate,
  cursor,
  cacheRef,
}): React.ReactElement => {
  const [onMouseDown] = useDragContext();

  return (
    <>
      {React.Children.map<React.ReactNode, React.ReactNode>(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement, {
              "aria-details": "draggable",
              onPointerDown: (event: PointerEvent) => onMouseDown(event, onDrag, onDrop, dragId, immediate, cursor, cacheRef),
            })
          : null
      )}
    </>
  );
};

export default Draggable;
