import React from "react";

/** Checked: nền trắng + tick đen (ATSH full-look trên nền tối). */
const CustomCheckboxCheckedWhiteIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="0.5" y="0.5" width="19" height="19" rx="3.5" fill="#FFFFFF" stroke="#9CA3AF" />
    <path d="M5 10L8.5 13.5L15 7" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default CustomCheckboxCheckedWhiteIcon;
