import * as React from 'react'
import type { SVGProps } from 'react'
const SvgFile = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    fill="none"
    className="file_svg__fill-current"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M19.834 19.75a2.25 2.25 0 0 1-2.25 2.25h-10.5a2.25 2.25 0 0 1-2.25-2.25V9.621c0-.596.236-1.169.658-1.59L10.86 2.66A2.25 2.25 0 0 1 12.45 2h5.133a2.25 2.25 0 0 1 2.25 2.25zm-2.25.75a.75.75 0 0 0 .75-.75V4.25a.75.75 0 0 0-.75-.75h-5.002l.002 4a2.25 2.25 0 0 1-2.25 2.25h-4v10c0 .414.335.75.75.75zM7.393 8.25l3.69-3.691.001 2.941a.75.75 0 0 1-.75.75zm1.19 6.25a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75m0 3a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgFile
