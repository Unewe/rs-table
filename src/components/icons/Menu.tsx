import React, { SVGProps } from "react";
import { getClassName } from "../../utils";

export const Menu: React.FC<SVGProps<SVGSVGElement>> = props => {
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      width={"16"}
      height={"16"}
      fill={"currentColor"}
      className={getClassName("menu")}
      viewBox={"0 0 16 16"}
      {...props}
    >
      <path
        d={
          "M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"
        }
      />
    </svg>
  );
};
