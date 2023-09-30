import React, { InputHTMLAttributes } from "react";
import "./index.scss";
import Unchecked from "../icons/Unchecked";
import Checked from "../icons/Checked";
import Indeterminate from "../icons/Indeterminate";
import { getClassName } from "../../utils/classNameUtils";
import Ripple from "../ripple/Ripple";
import { RippleRef } from "../ripple/Ripple.types";
import useForwardedRef from "../../hooks/useForwardedRef";
import useIsFocusVisible from "../../hooks/useIsFocuseVisible";

export type CheckboxProps = { indeterminate?: boolean } & InputHTMLAttributes<HTMLInputElement>;
const checkboxClassName = "checkbox";
const focusVisibleClassName = "focus-visible";

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ indeterminate, checked = false, style, ...props }, ref) => {
    const checkedRef = React.useRef(checked);
    const rippleRef = React.useRef<RippleRef>(null);
    const safeRef = useForwardedRef(ref);
    const { isFocusVisible, onFocus: handleFocus, onBlur: handleBlur } = useIsFocusVisible(safeRef);
    const [status, setStatus] = React.useState<"checked" | "unchecked" | "indeterminate">(
      indeterminate ? "indeterminate" : checked ? "checked" : "unchecked"
    );

    React.useEffect(() => {
      checkedRef.current = checked;
      setStatus(indeterminate ? "indeterminate" : checked ? "checked" : "unchecked");
    }, [indeterminate, checked]);

    const onMouseDown: React.MouseEventHandler<HTMLInputElement> = event => {
      props.onMouseDown?.(event);
      handleBlur();
      rippleRef.current?.onMouseDown?.(event);
    };

    const onClick: React.MouseEventHandler<HTMLInputElement> = event => {
      rippleRef.current?.onClick?.(event);
    };

    const onMouseLeave: React.MouseEventHandler<HTMLInputElement> = event => {
      rippleRef.current?.onMouseLeave?.(event);
      props.onMouseLeave?.(event);
    };

    const onFocus: React.FocusEventHandler<HTMLInputElement> = event => {
      handleFocus();
      props.onFocus?.(event);
    };

    const onBlur: React.FocusEventHandler<HTMLInputElement> = event => {
      handleBlur();
      props.onBlur?.(event);
    };

    const onChange: React.ChangeEventHandler<HTMLInputElement> = event => {
      checkedRef.current = (event.target as HTMLInputElement).checked;
      setStatus((event.target as HTMLInputElement).checked ? "checked" : "unchecked");
      props.onChange?.(event);
    };

    const icon = React.useMemo(() => {
      switch (status) {
        case "checked":
          return <Checked />;
        case "unchecked":
          return <Unchecked />;
        default:
          return <Indeterminate />;
      }
    }, [status]);

    const className = React.useMemo(
      () =>
        getClassName(checkboxClassName, status, props.disabled && "disabled", isFocusVisible && focusVisibleClassName),
      [status, props.disabled, isFocusVisible]
    );

    return (
      <span onClick={onClick} onMouseDown={onMouseDown} onMouseLeave={onMouseLeave} className={className} style={style}>
        <input
          data-testid={checkboxClassName}
          {...props}
          ref={safeRef}
          onFocus={onFocus}
          onBlur={onBlur}
          type={"checkbox"}
          onChange={onChange}
          checked={checkedRef.current}
        />
        {icon}
        <Ripple position={"center"} scale={0.5} ref={rippleRef} focus={isFocusVisible} />
      </span>
    );
  }
);

export default Checkbox;
