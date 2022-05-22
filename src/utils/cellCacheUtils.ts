import React from "react";

export const cachedCellRefs: Record<string, React.RefObject<HTMLDivElement>> = {};

export const getCellRef = (key: string): React.RefObject<HTMLDivElement> => {
  let ref = cachedCellRefs[key];
  if (!ref) {
    ref = cachedCellRefs[key] = React.createRef<HTMLDivElement>();
  }

  return ref;
}