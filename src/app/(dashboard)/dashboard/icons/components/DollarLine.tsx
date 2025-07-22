import type { SVGProps } from 'react'
import * as React from 'react'

const SvgDollarLine = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={25} height={24} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M13.416 2.792a.75.75 0 0 0-1.5 0v1.607a4.05 4.05 0 0 0-.857 7.8l2.688 1.008a2.548 2.548 0 0 1-.894 4.934h-1.057a1.863 1.863 0 0 1-1.864-1.864.75.75 0 0 0-1.5 0 3.363 3.363 0 0 0 3.364 3.364h.12v1.567a.75.75 0 0 0 1.5 0v-1.606a4.049 4.049 0 0 0 .858-7.8l-2.688-1.008a2.548 2.548 0 0 1 .895-4.934h1.056c1.03 0 1.864.834 1.864 1.863a.75.75 0 0 0 1.5 0 3.363 3.363 0 0 0-3.364-3.363h-.12z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgDollarLine
