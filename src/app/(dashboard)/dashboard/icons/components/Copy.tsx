import * as React from 'react'
import type { SVGProps } from 'react'
const SvgCopy = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M6.588 4.584a.5.5 0 0 1 .5-.5h8.327a.5.5 0 0 1 .5.5v8.329a.5.5 0 0 1-.5.5H7.088a.5.5 0 0 1-.5-.5zm.5-2a2 2 0 0 0-2 2v.51h-.503a2 2 0 0 0-2 2v8.322a2 2 0 0 0 2 2h8.322a2 2 0 0 0 2-2v-.503h.508a2 2 0 0 0 2-2V4.584a2 2 0 0 0-2-2zm6.319 12.329H7.088a2 2 0 0 1-2-2V6.594h-.503a.5.5 0 0 0-.5.5v8.322a.5.5 0 0 0 .5.5h8.322a.5.5 0 0 0 .5-.5z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgCopy
