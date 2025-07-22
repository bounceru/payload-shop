import type { SVGProps } from 'react'
import * as React from 'react'

const SvgInfo = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3.5 12a8.5 8.5 0 1 1 17 0 8.5 8.5 0 0 1-17 0M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2m-1 5.525a1 1 0 1 0 1.001-1h-.002a1 1 0 0 0-1 1m1 9.846a.75.75 0 0 1-.75-.75v-5.676a.75.75 0 0 1 1.5 0v5.676a.75.75 0 0 1-.75.75"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgInfo
