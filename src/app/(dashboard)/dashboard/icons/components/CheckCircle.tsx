import type { SVGProps } from 'react'
import * as React from 'react'

const SvgCheckCircle = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3.55 12a8.448 8.448 0 1 1 16.897 0 8.448 8.448 0 0 1-16.896 0M12 2.052c-5.494 0-9.948 4.454-9.948 9.948s4.454 9.948 9.948 9.948 9.948-4.454 9.948-9.948S17.493 2.052 12 2.052m3.514 8.581a.75.75 0 1 0-1.061-1.06l-3.264 3.263-1.642-1.642a.75.75 0 0 0-1.06 1.06l2.172 2.173a.75.75 0 0 0 1.06 0z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgCheckCircle
