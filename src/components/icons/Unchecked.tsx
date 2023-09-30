import React, { SVGProps } from "react";
import { getClassName } from "../../utils";

const className = getClassName("icon");
const Unchecked: React.FC<SVGProps<SVGSVGElement>> = props => {
  return (
    <svg
      {...props}
      className={className}
      focusable='false'
      aria-hidden='true'
      viewBox='0 0 20 20'
      width='20'
      height='20'
      data-testid='CheckBoxOutlineBlankIcon'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M3 2C2.44772 2 2 2.44772 2 3V17C2 17.5523 2.44771 18 3 18H17C17.5523 18 18 17.5523 18 17V3C18 2.44771 17.5523
      2 17 2H3ZM0 3C0 1.34315 1.34315 0 3 0H17C18.6569 0 20 1.34315 20 3V17C20 18.6569 18.6569 20 17 20H3C1.34315
      20 0 18.6569 0 17V3Z'
      />
    </svg>
  );
};

export default Unchecked;
