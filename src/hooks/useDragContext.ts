import {cachedCellRefs} from "../utils/cellCacheUtils";
import {getEventPosition} from "../utils/cellPositionUtiles";

export type Position = Record<"x" | "y", number>;
export type PointerListenerWithDirection = (event: PointerEvent, movement: Position) => void;
export type PointerListener = (event: PointerEvent) => void;
type DragEventInitiator = (
  event: PointerEvent,
  onDrag: PointerListenerWithDirection,
  onDrop?: PointerListener,
  cacheName?: string,
  immediate?: boolean
) => void;

class DragContext {
  private cacheName: string = "";
  private previousPosition?: Position;
  private initialPosition?: Position;
  private onDrag: PointerListenerWithDirection | undefined;
  private onDrop: PointerListener | undefined;
  private immediate: boolean = false;

  initiator: PointerListener = (event) => {
    const position = getEventPosition(event);
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

      this.previousPosition = position;
      const dragElementRef = cachedCellRefs[this.cacheName];
      if (dragElementRef?.current) {
        dragElementRef.current.classList.add("rs-dragged");
      }
    }
  }

  onMouseDown: DragEventInitiator = (event, onDrag, onDrop, cacheName = "", immediate = false) => {
    event.stopPropagation();
    this.initialPosition = getEventPosition(event);
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
    const position = getEventPosition(event);
    if (this.onDrag && this.previousPosition) {
      this.onDrag(event, {x: position.x - this.previousPosition.x, y: position.y - this.previousPosition.y});
    }
    this.previousPosition = position;
  }

  stopPropagation: PointerListener = (event) => event.stopPropagation();

  clear: () => void = () => {
    this.previousPosition = undefined;
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