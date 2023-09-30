import React, { useImperativeHandle, useMemo, useState } from "react";
import { emptyBoundingClientRect, getClassName } from "../../utils";
import "./index.scss";
import { RippleRef } from "./Ripple.types";

const rippleEffectClassName = "ripple-effect";
const rippleClassName = getClassName("ripple");
const focusRippleClassName = getClassName("focus-ripple");

interface RippleProps {
  scale?: number;
  position?: "center" | "click";
  focus?: boolean;
}

const Ripple = React.forwardRef<Partial<RippleRef>, RippleProps>((props, ref) => {
  const { scale = 1.3, position = "click", focus } = props;
  const wrapperRef = React.useRef<HTMLSpanElement>(null);
  const wrapperRect = wrapperRef.current?.getBoundingClientRect() ?? emptyBoundingClientRect;
  const [ripples, setRipples] = React.useState<JSX.Element[]>([]);
  const [active, setActive] = useState(false);
  const keyRef = React.useRef<number>(0);
  const className = useMemo(
    () => getClassName(rippleEffectClassName, active && `${rippleEffectClassName}-active`),
    [active]
  );

  const produce = (event: React.MouseEvent<Element, MouseEvent>): void => {
    setActive(true);
    const wrapperRect = wrapperRef.current?.getBoundingClientRect() ?? emptyBoundingClientRect;
    const width = wrapperRect.width * scale;
    const offsetY = position === "click" ? event.clientY : wrapperRect.top + wrapperRect.height / 2;
    const offsetX = position === "click" ? event.clientX : wrapperRect.left + wrapperRect.width / 2;
    const top = offsetY - wrapperRect.top - width;
    const left = offsetX - wrapperRect.left - width;

    const ripple = (
      <div
        className={rippleClassName}
        key={keyRef.current++}
        style={{ left, top, width: width * 2, height: width * 2 }}
      />
    );
    setRipples(state => [...state, ripple]);
  };

  const focusRipple = useMemo(() => {
    const size = wrapperRect.width;
    const top = wrapperRect.height / 2 - size / 2;
    return focus ? <div className={focusRippleClassName} style={{ top, width: size, height: size }} /> : null;
  }, [focus]);

  const damp = (): void => {
    if (active) setActive(false);
    if (ripples.length) setTimeout(() => setRipples(([_, ...rest]) => rest), 500);
  };

  useImperativeHandle(ref, () => ({
    onMouseDown: event => {
      produce(event);
    },
    onClick: _ => damp(),
    onMouseLeave: _ => damp(),
  }));

  return (
    <span className={className} ref={wrapperRef}>
      {focusRipple}
      {ripples}
    </span>
  );
});

export default Ripple;
