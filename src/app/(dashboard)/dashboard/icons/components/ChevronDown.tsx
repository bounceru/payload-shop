import * as React from 'react'
import type { SVGProps } from 'react'
const SvgChevronDown = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4.792 7.396 10 12.604l5.208-5.208"
    />
  </svg>
)
export default SvgChevronDown
