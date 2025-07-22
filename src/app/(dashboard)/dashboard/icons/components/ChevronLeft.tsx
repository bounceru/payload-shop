import type { SVGProps } from 'react'
import * as React from 'react'

const SvgChevronLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12.708 5 7.5 10.208l5.208 5.209"
    />
  </svg>
)
export default SvgChevronLeft
