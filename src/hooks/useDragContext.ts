import React, {useEffect} from "react";

class DragContext {
  refs: Set<React.RefObject<HTMLDivElement>> = new Set<React.RefObject<HTMLDivElement>>();
}

const context = new DragContext();

export const useDragContext = (...refs: Array<React.RefObject<HTMLDivElement>>) => {
  useEffect(() => {
    refs.forEach(context.refs.add);
  }, [refs]);
}