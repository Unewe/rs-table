import React, { useEffect, useMemo, useState } from "react";
import VerticalScrollbar, { VerticalScrollbarRef } from "./VerticalScrollbar";
import { PossibleIdType, RequiredDefinition, Row, TableApi, TechRow } from "./Table.types";
import GroupRowRenderer from "./GroupRowRenderer";
import TableRowRenderer from "./TableRowRenderer";
import { clearCellCache } from "../../utils/cacheUtils";
import { getClassName } from "../../utils";
import { HorizontalScrollbar } from "./HorizontalScrollbar";

interface TableContentProps<T> {
  apiRef: React.MutableRefObject<TableApi<T>>;
  tableRef: React.RefObject<HTMLDivElement>;
  visibleRows: Array<T | TechRow<T>>;
  colDefsRef: React.RefObject<RequiredDefinition<T>[]>;
  selected: Record<PossibleIdType, boolean>;
  expanded: Record<PossibleIdType, boolean>;
  capacity: number;
}

const tableWrapperClassName = getClassName("table-wrapper");
const tableContainerClassName = getClassName("table-container");

export const TableContent = <T extends Row>({
  apiRef,
  visibleRows,
  tableRef,
  colDefsRef,
  selected,
  expanded,
  capacity,
}: TableContentProps<T>): React.ReactElement => {
  const [offset, setOffset] = useState(0);
  const { rowHeight, headerHeight, virtualization } = apiRef.current;
  const edge = useMemo(() => capacity + offset, [capacity, offset]);
  const containerHeight = visibleRows.length * rowHeight;
  const [wrapperWidth, setWrapperWidth] = useState(tableRef.current?.clientWidth);
  const verticalScrollbarRef = React.useRef<VerticalScrollbarRef>(null);

  const virtualRows = useMemo(
    () => (virtualization ? visibleRows.slice(offset, edge) : visibleRows),
    [visibleRows, offset, edge]
  );

  // Следим за изменением ширины таблицы.
  useEffect(() => {
    setTimeout(() => {
      if (wrapperWidth !== tableRef.current?.clientWidth) {
        setWrapperWidth(tableRef.current?.clientWidth);
      }
    });
  });

  const verticalThumbHeight = useMemo(() => {
    const clientHeight = tableRef.current?.clientHeight ?? 0;
    const thumbHeight = (clientHeight * clientHeight) / containerHeight;

    return thumbHeight < 20 ? 20 : thumbHeight;
  }, [tableRef.current, containerHeight]);

  const horizontalThumbWidth = useMemo(() => {
    const clientWidth = wrapperWidth ?? 0;
    const tableWidth = colDefsRef.current?.map(value => value.width).reduce((acc, value) => acc + value, 0) ?? 0;
    const thumbWidth = (clientWidth * clientWidth) / tableWidth;

    return thumbWidth < 20 ? 20 : thumbWidth;
  }, [colDefsRef.current, wrapperWidth]);

  useEffect(() => {
    verticalScrollbarRef.current?.updateThumbPosition();
  }, [expanded]);

  const onScroll = (): void => {
    const tmp = Math.round(tableRef.current!.scrollTop / rowHeight);
    const nexOffset = Math.round(tmp - capacity / 3);
    apiRef.current.scrollPosition.y = tableRef.current!.scrollTop;
    verticalScrollbarRef.current?.updateThumbPosition();
    if (tmp >= offset + capacity * 0.63) {
      setOffset(nexOffset < 0 ? 0 : nexOffset);
    } else if (offset && tmp <= offset + capacity * 0.1) {
      setOffset(nexOffset < 0 ? 0 : nexOffset);
    } else if (tmp === 0) {
      setOffset(0);
    }
  };

  const tableRows = useMemo(() => {
    clearCellCache();
    return virtualRows.map((row, index) =>
      "$type" in row && row.$type === "_GroupRow" ? (
        <GroupRowRenderer key={row.id} offset={offset} index={index} row={row} apiRef={apiRef} />
      ) : (
        <TableRowRenderer
          key={row.id?.toString()}
          row={row}
          offset={offset}
          index={index}
          colDefsRef={colDefsRef}
          apiRef={apiRef}
        />
      )
    );
  }, [virtualRows, offset, edge, selected]);

  const contextHandler = apiRef.current?.onContext
    ? (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();
      apiRef.current?.onContext?.(event, undefined);
    }
    : undefined;

  const height = `calc(100% - ${headerHeight}px)`;

  return (
    <>
      <div
        ref={tableRef}
        className={tableWrapperClassName}
        style={{ maxHeight: height, height, maxWidth: "100%", width: "100%" }}
        onScrollCapture={onScroll}
        onContextMenu={contextHandler}
      >
        <div className={tableContainerClassName} style={{ height: containerHeight + "px" }}>
          {tableRows}
        </div>
      </div>
      <VerticalScrollbar
        ref={verticalScrollbarRef}
        apiRef={apiRef}
        containerRef={tableRef}
        thumbHeight={verticalThumbHeight}
      />
      <HorizontalScrollbar
        containerRef={tableRef}
        thumbWidth={horizontalThumbWidth}
        colDefsRef={colDefsRef}
        apiRef={apiRef}
      />
    </>
  );
};
