import React, { useEffect } from "react";

let isKeyboardEvent = false;

// Устанавливаем флаг нажатия клавиатуры.
function handleKeyDown(event: KeyboardEvent): void {
  if (event.metaKey || event.altKey || event.ctrlKey) {
    return;
  }
  isKeyboardEvent = true;
}

// При клике мыши снимаем флаг нажатия клавиатуры.
function handlePointerDown(): void {
  isKeyboardEvent = false;
}

function init(doc: Document): void {
  doc.addEventListener("keydown", handleKeyDown, true);
  doc.addEventListener("mousedown", handlePointerDown, true);
  doc.addEventListener("pointerdown", handlePointerDown, true);
  doc.addEventListener("touchstart", handlePointerDown, true);
}

export function destroy(doc: Document): void {
  doc.removeEventListener("keydown", handleKeyDown, true);
  doc.removeEventListener("mousedown", handlePointerDown, true);
  doc.removeEventListener("pointerdown", handlePointerDown, true);
  doc.removeEventListener("touchstart", handlePointerDown, true);
}

interface UseIsFocusVisibleResult {
  isFocusVisible: boolean;
  onBlur: () => void;
  onFocus: () => void;
}

/**
 * Хук для отслеживания получения фокуса элементом, не вызванном действиями мыши.
 * @param nodeRef ref элемента.
 */
const useIsFocusVisible = <T extends Element>(nodeRef: React.RefObject<T>): UseIsFocusVisibleResult => {
  const [isFocusVisible, setFocusVisible] = React.useState(false);

  useEffect(() => {
    if (nodeRef?.current) {
      init(nodeRef.current.ownerDocument);
    }
  }, [nodeRef?.current]);

  // Должен вызываться при потере фокуса.
  const onBlur = (): void => {
    setFocusVisible(false);
  };

  // Должен вызываться при получении фокуса.
  const onFocus = (): void => {
    setFocusVisible(isKeyboardEvent);
  };

  return { isFocusVisible, onFocus, onBlur };
};

export default useIsFocusVisible;
