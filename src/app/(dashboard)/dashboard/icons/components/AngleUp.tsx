import type { SVGProps } from 'react'
import * as React from 'react'

const SvgAngleUp = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={8} height={5} fill="none" {...props}>
    <path
      fill="currentColor"
      d="M4.41.585a.5.5 0 0 0-.82 0L1.05 4.213A.5.5 0 0 0 1.46 5h5.08a.5.5 0 0 0 .41-.787z"
    />
  </svg>
)
export default SvgAngleUp
