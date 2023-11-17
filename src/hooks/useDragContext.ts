import { getEventPosition } from "../utils";
import { Position } from "../components";
import {TableCache} from "../utils/cacheUtils";

export type PointerListenerWithDirection = (event: PointerEvent, movement: Position) => void;
export type PointerListener = (event: PointerEvent) => void;

type DragEventInitiator = (
  event: PointerEvent,
  onDrag: PointerListenerWithDirection,
  onDrop?: PointerListener,
  cacheName?: string,
  immediate?: boolean,
  cursor?: string,
  cacheRef?: TableCache
) => void;

const stopPropagation = (event: MouseEvent): void => event.stopPropagation();

class DragContext {
  private cacheName: string = "";
  private previousPosition?: Position;
  private initialPosition?: Position;
  private onDrag: PointerListenerWithDirection | undefined;
  private onDrop: PointerListener | undefined;
  private immediate: boolean = false;
  private isDragging = false;
  private cursor?: string;
  private previousCursor?: string;
  private cacheRef?: TableCache;

  initiator: PointerListener = event => {
    const position = getEventPosition(event);
    if (!this.initialPosition) {
      this.clear();
      return;
    }

    const xChanged = Math.abs(position.x - this.initialPosition.x) > 20;
    const yChanged = Math.abs(position.y - this.initialPosition.y) > 20;
    // Начало перетаскивания.
    if (this.immediate || xChanged || yChanged) {
      this.isDragging = true;
      // Предотвращение клика, при перетаскивании!
      document.removeEventListener("pointermove", this.initiator, true);
      document.addEventListener("pointermove", this.onMouseMove, true);
      document.addEventListener("click", stopPropagation, true);

      this.previousPosition = position;
      const dragElementRef = this.cacheRef?.cells[this.cacheName];
      if (dragElementRef?.current) {
        dragElementRef.current.classList.add("rs-dragged");
      }
    }
  };

  onMouseDown: DragEventInitiator = (event, onDrag, onDrop, cacheName = "", immediate = false, cursor = "", cacheRef) => {
    event.stopPropagation();
    this.cursor = cursor;
    this.initialPosition = getEventPosition(event);
    this.onDrag = onDrag;
    this.onDrop = onDrop;
    this.cacheName = cacheName;
    this.immediate = immediate;
    this.cacheRef = cacheRef;
    document.addEventListener("pointermove", this.initiator, true);
    document.addEventListener("pointerup", this.onMouseUp, true);
    if (this.cursor) {
      this.previousCursor = document.body.style.cursor;
      document.body.style.cursor = this.cursor;
    }
  };

  onMouseUp: PointerListener = event => {
    if (this.isDragging) {
      event.stopPropagation();
    }
    this.onDrop?.(event);
    this.clear();
  };

  onMouseMove: PointerListener = event => {
    const position = getEventPosition(event);
    if (this.onDrag && this.previousPosition) {
      this.onDrag(event, { x: position.x - this.previousPosition.x, y: position.y - this.previousPosition.y });
    }
    this.previousPosition = position;
  };

  clear: () => void = () => {
    this.previousPosition = undefined;
    this.onDrag = undefined;
    this.onDrop = undefined;
    this.initialPosition = undefined;
    this.isDragging = false;
    document.removeEventListener("pointermove", this.initiator, true);
    document.removeEventListener("pointermove", this.onMouseMove, true);
    document.removeEventListener("pointerup", this.onMouseUp, true);
    setTimeout(() => {
      document.removeEventListener("click", stopPropagation, true);
    }, 0);

    const dragElementRef = this.cacheRef?.cells[this.cacheName];
    if (dragElementRef?.current) {
      dragElementRef.current.classList.remove("rs-dragged");
    }
    this.cacheRef = undefined;
    this.cacheName = "";

    if (this.cursor) {
      if (this.previousCursor) {
        document.body.style.cursor = this.previousCursor;
      } else {
        document.body.style.removeProperty("cursor");
      }

      this.cursor = undefined;
    }
  };
}

const context = new DragContext();

export const useDragContext = (): [DragEventInitiator] => {
  return [context.onMouseDown];
};
