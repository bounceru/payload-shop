import * as React from 'react'
import type { SVGProps } from 'react'
const SvgUserLine = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M8.025 6.178a2.303 2.303 0 1 1 4.607 0 2.303 2.303 0 0 1-4.607 0m2.304-3.803a3.803 3.803 0 1 0 0 7.607 3.803 3.803 0 0 0 0-7.607M8.923 11.03a5.714 5.714 0 0 0-5.714 5.714v.29a.75.75 0 0 0 1.5 0v-.29a4.214 4.214 0 0 1 4.214-4.214h2.813a4.214 4.214 0 0 1 4.214 4.214v.29a.75.75 0 1 0 1.5 0v-.29a5.714 5.714 0 0 0-5.714-5.714z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgUserLine
