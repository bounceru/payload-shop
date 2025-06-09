import * as React from 'react'
import type { SVGProps } from 'react'
const SvgCheckLine = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="m13.402 4.36-7.28 7.28-3.524-3.523"
    />
  </svg>
)
export default SvgCheckLine
