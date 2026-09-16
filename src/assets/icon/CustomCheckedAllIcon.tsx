import React from "react";

const CustomCheckedAllIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="0.5" y="0.5" width="19" height="19" rx="3.5" fill="white" />
    <rect x="0.5" y="0.5" width="19" height="19" rx="3.5" stroke="#050505" />
    <path d="M5.625 10H14.375" stroke="#050505" strokeWidth="1.66666" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default CustomCheckedAllIcon;
