import * as React from 'react'
import type { SVGProps } from 'react'
const SvgEye = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M10 13.862a6.52 6.52 0 0 1-6.077-4.16 6.519 6.519 0 0 1 12.154 0A6.52 6.52 0 0 1 10 13.862m0-9.819a8.02 8.02 0 0 0-7.584 5.416.75.75 0 0 0 0 .487 8.019 8.019 0 0 0 15.169 0 .75.75 0 0 0 0-.487A8.02 8.02 0 0 0 10 4.043m-.008 3.801a1.858 1.858 0 1 0 0 3.716h.014a1.858 1.858 0 0 0 0-3.716z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgEye
