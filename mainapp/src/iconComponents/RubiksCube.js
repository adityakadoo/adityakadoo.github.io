import * as React from "react";

const SvgRubiksCube = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    style={{
      enableBackground: "new 0 0 512 512",
    }}
    xmlSpace="preserve"
    width="1em"
    height="1em"
    {...props}
  >
    <path stroke="currentColor" fill="currentColor" d="M0 182.044h147.911v147.911H0zM182.044 0h147.911v147.911H182.044zM182.044 182.044h147.911v147.911H182.044zM182.044 364.089h147.911V512H182.044zM460.8 0h-96.711v147.911H512V51.2C512 22.967 489.033 0 460.8 0zM364.089 182.044H512v147.911H364.089zM0 364.089V460.8C0 489.033 22.967 512 51.2 512h96.711V364.089H0zM364.089 364.089V512H460.8c28.233 0 51.2-22.967 51.2-51.2v-96.711H364.089zM51.2 0C22.967 0 0 22.967 0 51.2v96.711h147.911V0H51.2z" />
  </svg>
);

export default SvgRubiksCube;
