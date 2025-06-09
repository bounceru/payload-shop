import * as React from 'react'
import type { SVGProps } from 'react'
const SvgCalendar = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M8 2a.75.75 0 0 1 .75.75v1h6.5v-1a.75.75 0 0 1 1.5 0v1h1.75A2.25 2.25 0 0 1 20.75 6v13a2.25 2.25 0 0 1-2.25 2.25h-13A2.25 2.25 0 0 1 3.25 19V6A2.25 2.25 0 0 1 5.5 3.75h1.75v-1A.75.75 0 0 1 8 2m0 3.25H5.5a.75.75 0 0 0-.75.75v2.25h14.5V6a.75.75 0 0 0-.75-.75H8m11.25 4.5H4.75V19c0 .414.336.75.75.75h13a.75.75 0 0 0 .75-.75z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgCalendar
