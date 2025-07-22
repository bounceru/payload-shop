import type { SVGProps } from 'react'
import * as React from 'react'

const SvgList = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M5.5 3.25A2.25 2.25 0 0 0 3.25 5.5v13a2.25 2.25 0 0 0 2.25 2.25h13a2.25 2.25 0 0 0 2.25-2.25v-13a2.25 2.25 0 0 0-2.25-2.25zM4.75 5.5a.75.75 0 0 1 .75-.75h13a.75.75 0 0 1 .75.75v13a.75.75 0 0 1-.75.75h-13a.75.75 0 0 1-.75-.75zm1.5 4.214a.75.75 0 0 1 .75-.75h10a.75.75 0 1 1 0 1.5H7a.75.75 0 0 1-.75-.75m0 4.572a.75.75 0 0 1 .75-.75h10a.75.75 0 1 1 0 1.5H7a.75.75 0 0 1-.75-.75"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgList
