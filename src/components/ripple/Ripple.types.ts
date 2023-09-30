import React from "react";

export interface RippleRef {
  onBlur: React.FocusEventHandler;
  onFocus: React.FocusEventHandler;
  onKeyDown: React.KeyboardEventHandler;
  onKeyUp: React.KeyboardEventHandler;
  onMouseDown: React.MouseEventHandler;
  onClick: React.MouseEventHandler;
  onMouseLeave: React.MouseEventHandler;
}
