import {cachedCellRefs} from "../utils/cellCacheUtils";

type MouseListener = (event: MouseEvent) => void;
type DragEventInitiator = (event: MouseEvent, onDrag: MouseListener, cacheName?: string) => void;

class DragContext {
  private cacheName: string = "";
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
    // StartDragEvent.
    if (xChanged || yChanged) {
      // Prevent click then Drag!
      document.addEventListener("pointerup", this.stopPropagation, true);
      document.removeEventListener("pointermove", this.initiator, true);
      document.addEventListener("pointermove", this.onMouseMove, true);

      const dragElementRef = cachedCellRefs[this.cacheName];
      if (dragElementRef?.current) {
        dragElementRef.current.classList.add("rs-dragged");
      }
    }
  }

  onMouseDown: DragEventInitiator = (event, onDrag, cacheName = "") => {
    this.initialPosition = {x: event.clientX || event.pageX, y: event.clientY || event.pageY};
    this.onDrag = onDrag;
    this.cacheName = cacheName;
    document.addEventListener("pointermove", this.initiator, true);
    document.addEventListener("pointerup", this.onMouseUp, true);
  }

  onMouseUp: MouseListener = () => {
    this.clear();
  }

  onMouseMove: MouseListener = (event) => {
    if (this.onDrag) {
      this.onDrag(event);
    }
  }

  stopPropagation: MouseListener = (event) => event.stopPropagation();

  clear: () => void = () => {
    this.onDrag = undefined;
    this.initialPosition = undefined;
    document.removeEventListener("pointermove", this.initiator, true);
    document.removeEventListener("pointermove", this.onMouseMove, true);
    document.removeEventListener("pointerup", this.onMouseUp, true);
    // Allow click!
    setTimeout(() => document.removeEventListener("pointerup", this.stopPropagation));

    const dragElementRef = cachedCellRefs[this.cacheName];
    if (dragElementRef?.current) {
      dragElementRef.current.classList.remove("rs-dragged");
    }
    this.cacheName = "";
  }
}

const context = new DragContext();

export const useDragContext = () => {
  return [context.onMouseDown];
}