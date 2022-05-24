import React, {PropsWithChildren, useCallback, useEffect, useRef} from "react";

const Draggable: React.FC<PropsWithChildren<{ onDrag: (e: MouseEvent) => void, dragId?: string }>> = (
  {
    children,
    onDrag
  }): React.ReactElement => {
  const dragRef = useRef<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  const dragStart = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      dragRef.current = true;
    }, 200);
  }, []);

  useEffect(() => {
    const dragend = () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
        timeoutRef.current = undefined;
      }

      setTimeout(() => dragRef.current = false, 0);
    };
    const mousemove = (event: MouseEvent) => dragRef.current && onDrag(event);
    const click = (event: MouseEvent) => dragRef.current && event.stopPropagation();

    document.addEventListener("mousemove", mousemove, true);
    document.addEventListener("mouseup", dragend, true);
    document.addEventListener("click", click, true);

    return () => {
      document.removeEventListener("mousemove", mousemove, true);
      document.removeEventListener("mouseup", dragend, true);
      document.removeEventListener("click", click, true);
    };
  }, [onDrag]);

  return (
    <>
      {React.Children.map(children, child => React.isValidElement(child)
        ? React.cloneElement(child, {
          "aria-details": "draggable",
          onMouseDown: dragStart,
        })
        : null)}
    </>
  );
}

export default Draggable;