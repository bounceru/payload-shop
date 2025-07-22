import type { SVGProps } from 'react'
import * as React from 'react'

const SvgPlus = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M5.25 3a.75.75 0 0 1 1.5 0v2.25H9a.75.75 0 0 1 0 1.5H6.75V9a.75.75 0 0 1-1.5 0V6.75H3a.75.75 0 0 1 0-1.5h2.25z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgPlus
