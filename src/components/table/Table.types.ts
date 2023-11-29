import React, { MutableRefObject } from "react";
import { DialogRef } from "../dialog/Dialog";
import {TableCache} from "../../utils/cacheUtils";

export type PossibleIdType = string | number;
export type Row = Record<"id", PossibleIdType>;

export type TechRow<T = {}> = Partial<Omit<T, "id" | "$type" | "$id" | "$count" | "$name" | "$checkbox">> & {
  id: PossibleIdType;
  $id?: string;
  $level?: number;
  $type?: "_GroupRow";
  $count?: number;
  $name?: string;
  $checkbox?: string;
  $mock?: string;
};

export type CellRenderer<RowType> = (
  col: RequiredDefinition<RowType>,
  row: RowType,
  api: MutableRefObject<TableApi<RowType>>
) => React.ReactElement;

type GroupRowRenderer = <RowType>(
  row: TechRow<RowType>,
  apiRef: React.MutableRefObject<TableApi<RowType>>
) => React.ReactElement;

export interface TableProps<RowType extends Row> {
  data: Array<RowType>;
  colDefs: Array<ColumnDefinition<RowType>>;
  onSelect?: (selected: Record<RowType["id"], boolean>) => void;
  onExpand?: (expanded: Record<RowType["id"], boolean>) => void;
  onContext?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, row?: RowType | TechRow<RowType>) => void;
  selectionType?: "multiple" | "single";
  rowHeight?: number;
  headerHeight?: number;
  groupBy?: keyof RowType;
  treeBy?: keyof RowType;
  virtualization?: boolean;
  scrollSpeed?: number;
  state?: TableState<RowType>;
  groupRowRenderer?: GroupRowRenderer;
  filterComponent?: React.FC<FilterProps<RowType>>;
  onColDefChange?: (colDefs: Array<ColumnDefinition<RowType>>) => void;
  tableApiRef?: MutableRefObject<TableApi<RowType> | undefined>;
}

export interface TableState<RowType extends Row> {
  selected?: Record<RowType["id"], boolean>;
  expanded?: Record<RowType["id"], boolean>;
  sort?: Sort<RowType>;
  filter?: Filter<RowType>;
}

export interface Sort<RowType> {
  key: keyof RowType;
  direction: "asc" | "desc";
  function?: (a: RowType, b: RowType) => number;
}

export interface Filter<RowType> {
  key: keyof RowType;
  value?: unknown;
  predicate: (value: any) => boolean;
}

export interface TableApi<RowType> {
  selectRow: (id: PossibleIdType, value?: boolean) => void;
  expandRow: (id: PossibleIdType, value?: boolean) => void;
  grouped: Record<string, Array<RowType>>;
  selected: Record<PossibleIdType, boolean>;
  expanded: Record<PossibleIdType, boolean>;
  forceUpdate: () => void;
  selectAll: () => void;
  onContext?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, row?: RowType | TechRow<RowType>) => void;
  clearSelection: () => void;
  allRows: Array<RowType | TechRow<RowType>>;
  treeBy?: keyof RowType;
  groupBy?: keyof RowType;
  selectedCount: number;
  selectionType?: "multiple" | "single";
  rowHeight: number;
  headerHeight: number;
  virtualization: boolean;
  onSelect?: (selected: Record<PossibleIdType, boolean>) => void;
  groupRowRenderer?: GroupRowRenderer;
  scrollPosition: { x: number; y: number }; // Этот объект будет подвергаться мутации.
  wrapperRef: React.MutableRefObject<HTMLDivElement | null>;
  tableRef: React.MutableRefObject<HTMLDivElement | null>;
  width: number;
  colDefsRef: React.MutableRefObject<Array<RequiredDefinition<RowType>>>;
  setSort: React.Dispatch<React.SetStateAction<Sort<RowType> | undefined>>;
  sort?: Sort<RowType>;
  setFilter: React.Dispatch<React.SetStateAction<Filter<RowType> | undefined>>;
  filter?: Filter<RowType>;
  filterComponent?: React.FC<FilterProps<RowType>>;
  cacheRef: TableCache;
}

export interface FilterProps<T> {
  dialogRef: React.RefObject<DialogRef>;
  apiRef: MutableRefObject<TableApi<T>>;
  col: RequiredDefinition<T>;
}

interface Definition<RowType> {
  name: string;
  key: keyof RowType;
  sortable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  filterType?: "string" | "number" | "date" | string;
  fixed?: "left" | "right";
  sort?: (a: RowType, b: RowType) => number;
  tree?: boolean;
  headerRenderer?: (api: MutableRefObject<TableApi<RowType>>) => React.ReactElement;
}

interface ExtraDefinition<RowType> {
  renderer?: CellRenderer<RowType | TechRow<Row> | TechRow<RowType>>;
  minWidth?: number;
  width?: number;
  left?: number;
  index?: number;
}

export type ColumnDefinition<RowType> = Definition<RowType> & ExtraDefinition<RowType>;
export type RequiredDefinition<RowType> = Definition<RowType> & Required<ExtraDefinition<RowType>>;

export interface ParsedData<T extends Row> {
  visible: Array<T | TechRow<T>>;
  all: Array<T | TechRow<T>>;
  grouped: Record<string, Array<T>>;
  // Для оптимизации выбора всех элементов.
  allSelected: Record<string | number, boolean>;
}

export type Position = Record<"x" | "y", number>;