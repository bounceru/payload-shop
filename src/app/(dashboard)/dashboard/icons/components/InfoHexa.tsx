import type { SVGProps } from 'react'
import * as React from 'react'

const SvgInfoHexa = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M8.125 4.54h7.749a.75.75 0 0 1 .65.374l3.874 6.711a.75.75 0 0 1 0 .75l-3.875 6.71a.75.75 0 0 1-.65.376H8.126a.75.75 0 0 1-.65-.375L3.6 12.375a.75.75 0 0 1 0-.75l3.875-6.71a.75.75 0 0 1 .65-.376m7.749-1.5h-7.75a2.25 2.25 0 0 0-1.948 1.124l-3.875 6.711a2.25 2.25 0 0 0 0 2.25l3.875 6.71a2.25 2.25 0 0 0 1.949 1.126h7.749a2.25 2.25 0 0 0 1.948-1.125l3.875-6.711a2.25 2.25 0 0 0 0-2.25l-3.875-6.71a2.25 2.25 0 0 0-1.948-1.126M12 7.81a.75.75 0 0 1 .75.75v4.22a.75.75 0 0 1-1.5 0V8.56a.75.75 0 0 1 .75-.75M11 15.33a1 1 0 1 1 1 1 1 1 0 0 1-1-1"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgInfoHexa
