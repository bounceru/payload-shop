import * as React from 'react'
import type { SVGProps } from 'react'
const SvgAlert = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M13.95 3.875c-.866-1.5-3.031-1.5-3.897 0l-7.506 13c-.866 1.5.216 3.375 1.949 3.375h15.01c1.733 0 2.815-1.875 1.95-3.375zm-2.598.75a.75.75 0 0 1 1.299 0l7.505 13a.75.75 0 0 1-.65 1.125H4.497a.75.75 0 0 1-.65-1.125zm.65 3.936a.75.75 0 0 1 .75.75v4.22a.75.75 0 0 1-1.5 0V9.31a.75.75 0 0 1 .75-.75M11 16.08a1 1 0 1 1 1 1 1 1 0 0 1-1-1"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgAlert
