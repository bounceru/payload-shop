import type { SVGProps } from 'react'
import * as React from 'react'

const SvgPage = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M8.504 4.25a.75.75 0 0 1 .75-.75h6.024a.75.75 0 0 1 .53.22l2.473 2.472c.14.141.22.332.22.53V16.75a.75.75 0 0 1-.75.75H9.253a.75.75 0 0 1-.75-.75zM14.748 19H9.254a2.25 2.25 0 0 1-2.25-2.25V6.499h-.756a.75.75 0 0 0-.75.75V19.75c0 .414.336.75.75.75h7.75a.75.75 0 0 0 .75-.75zM7.004 4.999V4.25A2.25 2.25 0 0 1 9.254 2h6.024c.596 0 1.169.237 1.59.659l2.473 2.473c.422.422.66.994.66 1.59V16.75A2.25 2.25 0 0 1 17.75 19h-1.503v.75a2.25 2.25 0 0 1-2.25 2.25h-7.75a2.25 2.25 0 0 1-2.25-2.25V7.249a2.25 2.25 0 0 1 2.25-2.25z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgPage
