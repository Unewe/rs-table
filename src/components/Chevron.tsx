import React from "react";

type ChevronProps = {
  direction?: "right" | "bottom" | "top" | "left";
}

const Chevron: React.FC<ChevronProps> = ({direction = "right"}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
         width="16" height="16"
         fill="currentColor"
         className={`rs-chevron rs-${direction}`}
         viewBox="0 0 16 16">
      <path fillRule="evenodd"
            d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
    </svg>
  );
};

export default Chevron;