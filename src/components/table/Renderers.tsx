import React, { MutableRefObject, useMemo } from "react";
import { Primitive } from "./TableRowRenderer";
import Chevron from "../icons/Chevron";
import { CellRenderer, Row, TableApi, TechRow } from "./Table.types";
import { Checkbox } from "../index";
import { getClassName } from "../../utils";

/**
 * Функция для рендера ячейки с раскрытием дерева.
 * @param col колонка.
 * @param row строка.
 * @param api таблицы.
 */
export const treeCellRenderer: CellRenderer<TechRow<Row>> = (col, row, api) => {
  const children = row[api.current.treeBy!];
  const childrenSize = Array.isArray(children) ? children.length : 0;

  return (
    <>
      <div
        style={{ paddingLeft: `${row.$level ?? 0}rem`, height: "100%" }}
        onClickCapture={event => {
          event.stopPropagation();
          api.current.expandRow(row.id);
        }}
      >
        {!!childrenSize && (
          <div className={getClassName("tree-chevron")}>
            <Chevron className={"tree-chevron"} direction={api.current.expanded[row.id] ? "bottom" : "right"} />
          </div>
        )}
      </div>
      <div className={"rs-cell-content"} style={{ marginLeft: children ? 0 : "1rem" }}>
        {row[col.key] as Primitive}
      </div>
    </>
  );
};

export const checkboxCellRenderer: CellRenderer<Row> = (_, row, api) => {
  return (
    <Checkbox
      style={{ position: "absolute", left: "5px" }}
      onClick={() => api.current.selectRow(row.id)}
      checked={Boolean(api.current.selected[row.id])}
    />
  );
};

export const emptyCellRenderer: CellRenderer<Row> = () => {
  return <div />;
};

export const headerCheckboxCellRenderer = (api: MutableRefObject<TableApi<Row & any>>): React.ReactElement => {
  const { allRows, selectedCount, clearSelection, selectAll } = api.current;
  const handleClick = selectedCount === allRows.length ? clearSelection : selectAll;
  return (
    <Checkbox
      onClick={handleClick}
      indeterminate={selectedCount > 0 && selectedCount !== allRows.length}
      checked={selectedCount === allRows.length}
      style={{ position: "absolute", left: "5px" }}
    />
  );
};

export const defaultGroupRowRenderer = (
  row: TechRow<Row>,
  apiRef: MutableRefObject<TableApi<any>>
): React.ReactElement => {
  const { expandRow, expanded, onSelect, selectionType, grouped, selected, selectRow } = apiRef.current;
  const groupRows = grouped[row.$name ?? ""];
  const allRowsSelected = useMemo(() => groupRows?.every(({ id }) => selected[id]), [selected, grouped]);
  const someRowsSelected = useMemo(() => groupRows?.some(({ id }) => selected[id]), [selected, grouped]);
  const handleCheckboxClick = (): void => {
    groupRows?.forEach(value => selectRow(value.id, !allRowsSelected));
  };

  return (
    <>
      <div onClick={() => expandRow(row.$name ?? "")} className={getClassName("group-chevron")}>
        <Chevron direction={expanded[row.$name ?? ""] ? "bottom" : "right"} />
      </div>
      {onSelect && selectionType === "multiple" && (
        <Checkbox
          onClick={handleCheckboxClick}
          checked={allRowsSelected}
          indeterminate={!allRowsSelected && someRowsSelected}
        />
      )}
      <div style={{ marginLeft: "15px" }}>
        {row.$name} ({row.$count})
      </div>
    </>
  );
};

export const defaultCheckboxColDef: any = {
  name: "",
  width: 44,
  minWidth: 44,
  renderer: checkboxCellRenderer,
  key: "$checkbox",
  headerRenderer: headerCheckboxCellRenderer,
  sortable: false,
  draggable: false,
  resizable: false,
};

export const emptyColDef: any = {
  name: "",
  width: 40,
  minWidth: 40,
  renderer: emptyCellRenderer,
  key: "$mock",
  sortable: false,
  draggable: false,
  resizable: false,
};

/**
 * Функция для рендера обычной ячейки.
 * @param col колонка.
 * @param row строка.
 */
export const cellRenderer: CellRenderer<Row> = (col, row) => {
  return <div className={"rs-cell-content"}>{row[col.key] as Primitive}</div>;
};
