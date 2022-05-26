import {ReactElement} from "react";

type MouseListener = (event: MouseEvent) => void;
type DragEventInitiator = (event: MouseEvent, onDrag: MouseListener, element: ReactElement) => void;

class DragContext {
  private element: ReactElement | undefined;
  private initialPosition: Record<"x" | "y", number> | undefined;
  private onDrag: MouseListener | undefined;

  initiator: MouseListener = (event) => {
    const position = {x: event.clientX || event.pageX, y: event.clientY || event.pageY};
    if (!this.initialPosition) {
      this.clear();
      return;
    }

    const xChanged = Math.abs(position.x - this.initialPosition.x) > 20;
    const yChanged = Math.abs(position.y - this.initialPosition.y) > 20;

    if (xChanged || yChanged) {
      // Prevent click then Drag!
      document.addEventListener("click", this.stopPropagation, true);
      document.removeEventListener("mousemove", this.initiator, true);
      document.addEventListener("mousemove", this.onMouseMove, true);
    }
  }

  onMouseDown: DragEventInitiator = (event, onDrag, element) => {
    this.initialPosition = {x: event.clientX || event.pageX, y: event.clientY || event.pageY};
    this.onDrag = onDrag;
    this.element = element;
    document.addEventListener("mousemove", this.initiator, true);
    document.addEventListener("mouseup", this.onMouseUp, true);
  }

  onMouseUp: MouseListener = () => {
    this.clear();
  }

  onMouseMove: MouseListener = (event) => {
    if (this.element && this.onDrag) {
      this.onDrag(event);
    }
  }

  stopPropagation: MouseListener = (event) => event.stopPropagation();

  clear: () => void = () => {
    this.onDrag = undefined;
    this.element = undefined;
    this.initialPosition = undefined;
    document.removeEventListener("mousemove", this.initiator, true);
    document.removeEventListener("mousemove", this.onMouseMove, true);
    document.removeEventListener("mouseup", this.onMouseUp, true);
    // Allow click!
    setTimeout(() => document.removeEventListener("click", this.stopPropagation, true));
  }
}

const context = new DragContext();

export const useDragContext = () => {
  return [context.onMouseDown];
}