import type { SVGProps } from 'react'
import * as React from 'react'

const SvgPaperPlane = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M4.985 2.444c-1.872-.873-3.832 1.026-3.02 2.924l1.856 4.337a.75.75 0 0 1 0 .59l-1.856 4.337c-.812 1.899 1.148 3.797 3.02 2.925l11.833-5.517c1.733-.808 1.733-3.271 0-4.079zm-1.64 2.334c-.271-.633.382-1.265 1.006-.975l11.834 5.518a.75.75 0 0 1 0 1.359L4.35 16.197c-.624.29-1.277-.342-1.006-.975L5.2 10.885a2 2 0 0 0 .054-.138h3.864a.75.75 0 0 0 0-1.5H5.252a2 2 0 0 0-.052-.132z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgPaperPlane
