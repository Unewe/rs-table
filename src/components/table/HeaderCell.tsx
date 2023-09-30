import React, { MutableRefObject } from "react";
import { getCellRef, getClassName } from "../../utils";
import { Arrow } from "../icons/Arrow";
import { RequiredDefinition, Row, TableApi, TechRow } from "./Table.types";
import Draggable from "./Draggable";
import { applyResize, resizeColumn } from "../../utils/positionUtiles";
import { Menu } from "../icons/Menu";
import { Dialog, DialogRef } from "../dialog/Dialog";

interface HeaderRowProps<T> {
  apiRef: MutableRefObject<TableApi<T>>;
  col: RequiredDefinition<T>;
  colDefsRef: React.RefObject<Array<RequiredDefinition<T>>>;
  headerHeight: number;
}

const cellClassName = getClassName("header-cell", "animated");

const HeaderCell = <T extends TechRow<Row>>({
  headerHeight,
  col,
  apiRef,
  colDefsRef,
  ...props
}: HeaderRowProps<T>): React.ReactElement => {
  const dialogRef = React.useRef<DialogRef>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const colsLength = colDefsRef.current?.length ?? 0;
  const { sort, setSort } = apiRef.current;

  const handleSortClick = (): void => {
    col.sortable &&
      setSort(prevState => {
        if (prevState?.key === col.key && prevState.direction === "desc") {
          return undefined;
        } else {
          return {
            key: col.key,
            direction: prevState?.key === col.key && prevState.direction === "asc" ? "desc" : "asc",
            function: col.sort,
          };
        }
      });
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation();
    dialogRef.current?.setOpen(value => !value);
  };

  const Filter = apiRef.current.filterComponent;

  return (
    <div
      ref={getCellRef(col.key.toString(), true)}
      {...props}
      aria-colindex={col.index}
      onClick={handleSortClick}
      className={cellClassName}
      style={{
        left: `${col.left}px`,
        minWidth: `${col.minWidth}px`,
        width: `${col.width}px`,
        height: `${headerHeight}px`,
        zIndex: col.fixed ? 100 : colsLength - col.index,
      }}
    >
      {col.headerRenderer ? col.headerRenderer(apiRef) : <div className={getClassName("cell-content")}>{col.name}</div>}
      {col.sortable && col.key === sort?.key && <Arrow direction={sort.direction === "asc" ? "bottom" : "top"} />}
      {col.filterType && Filter ? (
        <>
          <div ref={menuRef} className={getClassName("filter")} onClick={handleFilterClick}>
            <Menu />
          </div>
          <div onClick={event => event.stopPropagation()} onPointerDown={event => event.stopPropagation()}>
            <Dialog ref={dialogRef} forRef={menuRef}>
              <Filter dialogRef={dialogRef} apiRef={apiRef} col={col} />
            </Dialog>
          </div>
        </>
      ) : null}
      {col.resizable && (
        <Draggable
          onDrag={event => resizeColumn(event, col, colDefsRef)}
          cursor={"col-resize"}
          onDrop={() => applyResize(apiRef)}
        >
          <div className={getClassName("resize")} />
        </Draggable>
      )}
    </div>
  );
};

export default HeaderCell;
