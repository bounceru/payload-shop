import * as React from 'react'
import type { SVGProps } from 'react'
const SvgDownload = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    fill="none"
    className="download_svg__fill-current"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12.669 16.75a.75.75 0 0 1-.548-.237l-4.61-4.607a.75.75 0 0 1 1.06-1.061l3.348 3.345V4a.75.75 0 0 1 1.5 0v10.185l3.343-3.34a.75.75 0 0 1 1.06 1.06l-4.575 4.573a.75.75 0 0 1-.578.272M5.417 16a.75.75 0 0 0-1.5 0v2.5a2.25 2.25 0 0 0 2.25 2.25h13a2.25 2.25 0 0 0 2.25-2.25V16a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 1-.75.75h-13a.75.75 0 0 1-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgDownload
