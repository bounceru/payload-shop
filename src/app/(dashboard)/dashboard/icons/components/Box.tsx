import * as React from 'react'
import type { SVGProps } from 'react'
const SvgBox = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M9.777 3.242a.5.5 0 0 1 .447 0l5.147 2.574-5.035 2.517a.75.75 0 0 1-.67 0L4.63 5.816zM3.703 7.03v6.383a.5.5 0 0 0 .276.448l5.271 2.635V9.784a2 2 0 0 1-.256-.109zm7.047 9.467V9.784a2 2 0 0 0 .257-.109l5.291-2.646v6.383a.5.5 0 0 1-.276.448zm-1.335.987-.309.617a2 2 0 0 0 1.789 0l5.798-2.899a2 2 0 0 0 1.105-1.789V6.588A2 2 0 0 0 16.693 4.8l-5.798-2.898a2 2 0 0 0-1.789 0l.336.67-.336-.67-5.798 2.898a2 2 0 0 0-1.105 1.79v6.823a2 2 0 0 0 1.105 1.79L9.106 18.1z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgBox
