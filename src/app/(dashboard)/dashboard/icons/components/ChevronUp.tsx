import type { SVGProps } from 'react'
import * as React from 'react'

const SvgChevronUp = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M15.833 12.708 10.625 7.5l-5.208 5.208"
    />
  </svg>
)
export default SvgChevronUp
