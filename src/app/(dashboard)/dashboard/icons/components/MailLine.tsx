import * as React from 'react'
import type { SVGProps } from 'react'
const SvgMailLine = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3.5 8.187v9.063c0 .414.336.75.75.75h15.5a.75.75 0 0 0 .75-.75V8.187l-7.213 5.03c-.773.54-1.8.54-2.574 0zm17-1.958v.015a.24.24 0 0 1-.1.185l-7.97 5.558a.75.75 0 0 1-.859 0l-7.97-5.558A.236.236 0 0 1 3.736 6h16.528c.128 0 .232.102.236.229m1.5.027V17.25a2.25 2.25 0 0 1-2.25 2.25H4.25A2.25 2.25 0 0 1 2 17.25V6.204A1.736 1.736 0 0 1 3.737 4.5h16.528c.959 0 1.736.777 1.736 1.735z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgMailLine
