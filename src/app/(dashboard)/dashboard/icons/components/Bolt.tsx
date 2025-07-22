import type { SVGProps } from 'react'
import * as React from 'react'

const SvgBolt = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={26} fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12.814 4.75 4.785 16.035h6.4v7.215l8.03-11.285h-6.401z"
    />
  </svg>
)
export default SvgBolt
