import * as React from 'react'
import type { SVGProps } from 'react'
const SvgTask = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M7.756 5.501a.75.75 0 0 1 .75-.75h9.993a.75.75 0 0 1 .75.75v9.995a.75.75 0 0 1-.75.75H8.506a.75.75 0 0 1-.75-.75zm.75-2.25a2.25 2.25 0 0 0-2.25 2.25v.762h-.754a2.25 2.25 0 0 0-2.25 2.25V18.5a2.25 2.25 0 0 0 2.25 2.25h9.986a2.25 2.25 0 0 0 2.25-2.25v-.754h.76a2.25 2.25 0 0 0 2.25-2.25V5.5a2.25 2.25 0 0 0-2.25-2.25zm7.732 14.495H8.506a2.25 2.25 0 0 1-2.25-2.25V7.763h-.754a.75.75 0 0 0-.75.75V18.5c0 .414.336.75.75.75h9.986a.75.75 0 0 0 .75-.75z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgTask
