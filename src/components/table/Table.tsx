import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./index.scss";
import useParseData from "../../hooks/useParseData";
import { getClassName, handleScrollActions, updateDefsPosition } from "../../utils";
import Draggable from "./Draggable";
import HeaderCell from "./HeaderCell";
import { treeCellRenderer, cellRenderer } from "./Renderers";
import { Filter, Position, RequiredDefinition, Row, Sort, TableApi, TableProps } from "./Table.types";
import { TableContent } from "./TableContent";

const DEFAULT_ROW_HEIGHT = 38;
const DEFAULT_HEADER_HEIGHT = 35;
const MIN_WIDTH = 60;

function Table<T extends Row>(props: TableProps<T>): React.ReactElement {
  const {
    data,
    colDefs,
    onSelect,
    selectionType = "multiple",
    rowHeight = DEFAULT_ROW_HEIGHT,
    headerHeight = DEFAULT_HEADER_HEIGHT,
    groupBy,
    treeBy,
    virtualization = true,
    scrollSpeed = 1,
    state,
    groupRowRenderer,
    onColDefChange,
    filterComponent,
    onExpand,
  } = props;
  const [update, setUpdate] = useState(false);
  const [expanded, setExpanded] = useState<Record<Row["id"], boolean>>(state?.expanded ?? {});
  const [selected, setSelected] = useState<Record<Row["id"], boolean>>(state?.selected ?? {});
  const selectedCounterRef = useRef<number>(Object.keys(state?.selected ?? {}).length);
  const [sort, setSort] = useState<Sort<T> | undefined>(state?.sort);
  const [filter, setFilter] = useState<Filter<T> | undefined>(state?.filter);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [capacity, setCapacity] = useState(0);
  const colDefsRef = useRef<Array<RequiredDefinition<T>>>([]);

  const apiRef = useRef<TableApi<T>>({
    expanded: {},
    selected: {},
    expandRow: () => {},
    selectRow: () => {},
    forceUpdate: () => {},
    allRows: [],
    clearSelection: () => {},
    selectAll: () => {},
    selectedCount: selectedCounterRef.current,
    rowHeight,
    headerHeight,
    grouped: {},
    virtualization,
    scrollPosition: { x: 0, y: 0 },
    wrapperRef,
    tableRef,
    width: 0,
    colDefsRef,
    setSort,
    setFilter,
  });

  const {
    visible: visibleRows,
    all: allRows,
    allSelected,
    grouped,
  } = useParseData(data, expanded, groupBy, treeBy, sort, filter);

  useEffect(() => onSelect?.(selected), [selected]);
  useEffect(() => onExpand?.(expanded), [expanded]);

  const selectRow = useCallback((id: Row["id"], value: boolean | undefined) => {
    setSelected(selected => {
      const tmp = selectionType === "single" ? {} :{ ...selected };

      if ((value === undefined && !selected[id]) || (value === true && !selected[id])) {
        tmp[id] = true;
        selectedCounterRef.current++;
        return tmp;
      } else if ((value === undefined && selected[id]) || (value === false && selected[id])) {
        delete tmp[id];
        selectedCounterRef.current--;
        return tmp;
      } else {
        return selected;
      }
    });
  }, []);

  const expandRow = useCallback((id: Row["id"]) => {
    setExpanded(expanded => {
      if (expanded[id]) {
        const tmp = { ...expanded };
        delete tmp[id];
        return tmp;
      } else {
        return { ...expanded, [id]: true };
      }
    });
  }, []);

  const forceUpdate = (): void => {
    setUpdate(value => !value);
  };

  const selectAll = (): void => {
    setSelected(allSelected);
    selectedCounterRef.current = allRows.length;
  };

  const clearSelection = (): void => {
    setSelected({});
    selectedCounterRef.current = 0;
  };

  useEffect(() => {
    if (tableRef.current?.clientHeight) {
      const changedCapacity = (tableRef.current.clientHeight / rowHeight) * 4;
      capacity < changedCapacity && setCapacity(changedCapacity);
    }
  }, [tableRef.current?.clientHeight]);

  // Обработка scroll событий.
  useEffect(() => handleScrollActions(wrapperRef, tableRef, scrollSpeed), [wrapperRef.current, update]);

  useEffect(() => {
    if (tableRef.current != null && !colDefsRef.current.length) {
      const fixedLeft = colDefs.filter(col => col.fixed === "left").map(col => ({ ...col, draggable: false }));
      const fixedRight = colDefs.filter(col => col.fixed === "right").map(col => ({ ...col, draggable: false }));
      const rest = colDefs.filter(col => !col.fixed);
      const defs = [...fixedLeft, ...rest, ...fixedRight];
      const withWidth = defs.filter(value => value.width);
      const fixedWidth = withWidth.reduce((acc, value) => acc + (value.width ?? 0), 0);

      const flexWidth = Math.floor((tableRef.current.clientWidth - fixedWidth) / (defs.length - withWidth.length));
      let error = tableRef.current.clientWidth - fixedWidth - flexWidth * (colDefs.length - withWidth.length);
      colDefsRef.current = defs.reduce((acc: RequiredDefinition<T>[], value, index) => {
        const left =
          index === 0
            ? 0
            : (acc[index - 1].left || 0) +
              (acc[index - 1].width || flexWidth > 0 ? acc[index - 1].width || flexWidth : MIN_WIDTH);
        const defaultRenderer = treeBy && value.tree ? treeCellRenderer : cellRenderer;
        const renderer = value.renderer ?? defaultRenderer;

        acc[index] = {
          ...value,
          left,
          width: value.width ?? flexWidth + (error-- > 0 ? 1 : 0),
          minWidth: value.minWidth ?? MIN_WIDTH,
          index,
          draggable: value.draggable !== false && !value.draggable,
          resizable: value.resizable !== false && !value.fixed,
          sortable: value.sortable !== false,
          renderer,
        };

        return acc;
      }, []);

      for (let i = colDefsRef.current.length - 1; i >= 0; i--) {
        if (!colDefsRef.current[i].fixed) break;

        const previousPosition =
          i === colDefsRef.current.length - 1 ? tableRef.current.clientWidth : colDefsRef.current[i + 1].left;

        colDefsRef.current[i].left = previousPosition - colDefsRef.current[i].width;
      }

      if (treeBy && colDefsRef.current.find(col => col.tree) === undefined) {
        const first = colDefsRef.current.find(col => col.index === 0);

        if (first != null) {
          first.tree = true;
        }
      }
    }
  }, [tableRef.current?.clientWidth, update]);

  useEffect(() => {
    if (apiRef.current.colDefsRef.current) {
      onColDefChange?.(apiRef.current.colDefsRef.current);
    }
  }, [apiRef.current.colDefsRef.current]);

  apiRef.current = {
    ...apiRef.current,
    expanded,
    selected,
    expandRow,
    selectRow,
    forceUpdate,
    treeBy,
    groupBy,
    selectionType,
    selectAll,
    clearSelection,
    allRows,
    selectedCount: selectedCounterRef.current,
    rowHeight,
    headerHeight,
    grouped,
    virtualization,
    groupRowRenderer,
    onSelect,
    sort,
    filter,
    filterComponent,
    width: colDefsRef.current?.map(value => value.width).reduce((acc, value) => acc + value, 0) ?? 0,
  };

  const handleDrag = useCallback((event: MouseEvent, movement: Position, colDef: RequiredDefinition<T>): void => {
    if (colDef.draggable !== false) {
      const newColRefs = updateDefsPosition(event, movement, tableRef, colDef, colDefsRef, apiRef);

      if (newColRefs != null) {
        colDefsRef.current = newColRefs;
      }
    }
  }, []);

  const tableHeaders = useMemo(
    () => (
      <div className={"rs-header-wrapper"} style={{ height: headerHeight + "px" }}>
        {colDefsRef.current.map(col => (
          <Draggable
            key={col.key.toString()}
            dragId={`header_${col.key.toString()}`}
            onDrag={(event: MouseEvent, movement: Position) => handleDrag(event, movement, col)}
            onDrop={apiRef.current.forceUpdate}
          >
            <HeaderCell col={col} headerHeight={headerHeight} colDefsRef={colDefsRef} apiRef={apiRef} />
          </Draggable>
        ))}
      </div>
    ),
    [colDefsRef.current, selected, sort]
  );

  const { scrollPosition, width } = apiRef.current;
  const pinnedLeft = scrollPosition.x === 0;
  const pinnedRight = wrapperRef.current && scrollPosition.x > width - wrapperRef.current.clientWidth - 1;
  const pinnedLeftOffset = colDefsRef.current
    .filter(value => value.fixed === "left")
    .reduce((acc, value) => acc + value.width, 0);
  const pinnedRightOffset = colDefsRef.current
    .filter(value => value.fixed === "right")
    .reduce((acc, value) => acc + value.width, 0);

  const pinnedShadow = React.useMemo((): React.ReactElement | undefined => {
    if (pinnedLeftOffset || pinnedRightOffset) {
      return (
        <div className={getClassName("pinned-shadow")}>
          {Boolean(pinnedLeftOffset) && (
            <div className={getClassName("pinned-shadow-left")} style={{ width: `${pinnedLeftOffset}px` }} />
          )}
          {Boolean(pinnedRightOffset) && (
            <div className={getClassName("pinned-shadow-right")} style={{ width: `${pinnedRightOffset}px` }} />
          )}
        </div>
      );
    } else {
      return undefined;
    }
  }, [pinnedLeftOffset, pinnedRightOffset]);

  return (
    <div
      style={{ height: "100%" }}
      className={getClassName("wrapper", pinnedLeft && "pinned-left", pinnedRight && "pinned-right")}
      ref={wrapperRef}
    >
      {tableHeaders}
      <TableContent
        apiRef={apiRef}
        visibleRows={visibleRows}
        tableRef={tableRef}
        colDefsRef={colDefsRef}
        capacity={capacity}
        selected={selected}
        expanded={expanded}
      />
      {pinnedShadow}
    </div>
  );
}

export default Table;
