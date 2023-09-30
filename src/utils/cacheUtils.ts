import React from "react";

interface TableCache {
  cells: Record<string, React.RefObject<HTMLDivElement>>;
  headerCells: Record<string, React.RefObject<HTMLDivElement>>;
}

export const cacheRef: TableCache = { cells: {}, headerCells: {} };

export const clearCellCache = (): void => {
  cacheRef.cells = {};
};

export const getCellRef = (key: string, header: boolean = false): React.RefObject<HTMLDivElement> => {
  const cache = header ? cacheRef.headerCells : cacheRef.cells;
  let ref = cache[key];
  if (!ref) {
    ref = cache[key] = React.createRef<HTMLDivElement>();
  }

  return ref;
};

export default getCellRef;
