import type { SVGProps } from 'react'
import * as React from 'react'

const SvgPieChart = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12 2a.75.75 0 0 0-.75.75V12c0 .414.336.75.75.75h9.25A.75.75 0 0 0 22 12c0-5.523-4.477-10-10-10m.75 9.25V3.533a8.492 8.492 0 0 1 5.26 2.457 8.5 8.5 0 0 1 2.457 5.26zM2 12c0-4.75 3.31-8.725 7.75-9.746v1.547A8.5 8.5 0 1 0 20.199 14.25h1.547C20.726 18.69 16.749 22 12 22 6.477 22 2 17.523 2 12"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgPieChart
