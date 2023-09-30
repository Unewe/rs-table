import React, { useEffect, useImperativeHandle, useMemo, useState } from "react";
import * as ReactDOM from "react-dom";
import { Position } from "../table";
import { getClassName } from "../../utils";
import "./index.scss";

export interface DialogRef {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type DialogProps = {
  position?: Position;
  closeByBackdrop?: boolean;
  forRef?: React.RefObject<HTMLDivElement>;
} & React.PropsWithChildren<unknown>;

export const Dialog = React.forwardRef<DialogRef, DialogProps>(
  ({ children, position, closeByBackdrop = true, forRef }, ref) => {
    const [open, setOpen] = useState(false);
    const previousOverflowRef = React.useRef<string | undefined>();
    const positioned = Boolean(position ?? forRef);

    useImperativeHandle(ref, () => ({
      setOpen,
    }));

    useEffect(() => {
      if (position) return;
      if (open) {
        previousOverflowRef.current = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      } else {
        if (previousOverflowRef.current) {
          document.body.style.overflow = previousOverflowRef.current;
        } else {
          document.body.style.removeProperty("overflow");
        }
      }
    }, [open]);

    const onBackdropClick = (): void => {
      closeByBackdrop && setOpen(false);
    };

    const left = position?.x ?? forRef?.current?.getBoundingClientRect().left;
    const top = position?.y ?? forRef?.current?.getBoundingClientRect().bottom;

    const containerStyle: React.CSSProperties = left && top ? { left, top, position: "absolute" } : {};

    const dialogContent = useMemo(() => {
      if (open) {
        return (
          <div onClick={onBackdropClick} className={getClassName("dialog")}>
            {!positioned && <div className={getClassName("backdrop")} />}
            <div
              onClick={event => event.stopPropagation()}
              style={containerStyle}
              className={getClassName("dialog-container")}
            >
              {children}
            </div>
          </div>
        );
      } else {
        return <></>;
      }
    }, [open]);

    return ReactDOM.createPortal(dialogContent, document.body);
  }
);
