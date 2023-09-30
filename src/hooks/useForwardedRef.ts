import React from "react";

const useForwardedRef = <T>(ref: React.ForwardedRef<T>): React.RefObject<T> => {
  const innerRef = React.useRef(null);

  React.useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(innerRef.current);
    } else {
      ref.current = innerRef.current;
    }
  });

  return innerRef;
};

export default useForwardedRef;
