import {cachedCellRefs} from "../utils/cellCacheUtils";

type PointerListener = (event: PointerEvent) => void;
type DragEventInitiator = (
  event: MouseEvent,
  onDrag: PointerListener,
  onDrop?: PointerListener,
  cacheName?: string,
  immediate?: boolean
) => void;

class DragContext {
  private cacheName: string = "";
  private initialPosition: Record<"x" | "y", number> | undefined;
  private onDrag: PointerListener | undefined;
  private onDrop: PointerListener | undefined;
  private immediate: boolean = false;

  initiator: PointerListener = (event) => {
    const position = {x: event.clientX || event.pageX, y: event.clientY || event.pageY};
    if (!this.initialPosition) {
      this.clear();
      return;
    }

    const xChanged = Math.abs(position.x - this.initialPosition.x) > 20;
    const yChanged = Math.abs(position.y - this.initialPosition.y) > 20;
    // StartDragEvent.
    if (this.immediate || xChanged || yChanged) {
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

  onMouseDown: DragEventInitiator = (event, onDrag, onDrop, cacheName = "", immediate = false) => {
    event.stopPropagation();
    this.initialPosition = {x: event.clientX || event.pageX, y: event.clientY || event.pageY};
    this.onDrag = onDrag;
    this.onDrop = onDrop;
    this.cacheName = cacheName;
    this.immediate = immediate;
    document.addEventListener("pointermove", this.initiator, true);
    document.addEventListener("pointerup", this.onMouseUp, true);
  }

  onMouseUp: PointerListener = (event) => {
    event.stopPropagation();
    this.onDrop && this.onDrop(event);
    this.clear();
  }

  onMouseMove: PointerListener = (event) => {
    if (this.onDrag) {
      this.onDrag(event);
    }
  }

  stopPropagation: PointerListener = (event) => event.stopPropagation();

  clear: () => void = () => {
    this.onDrag = undefined;
    this.onDrop = undefined;
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