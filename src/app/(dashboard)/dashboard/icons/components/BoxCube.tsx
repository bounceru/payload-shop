import type { SVGProps } from 'react'
import * as React from 'react'

const SvgBoxCube = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M11.665 3.756a.75.75 0 0 1 .67 0l6.446 3.223-6.445 3.222a.75.75 0 0 1-.671 0L5.22 6.979zM4.293 8.192v7.903c0 .284.16.543.415.67l6.542 3.271v-8.385a2 2 0 0 1-.256-.108zm8.457 11.845 6.543-3.272a.75.75 0 0 0 .415-.67V8.192l-6.701 3.35q-.126.063-.257.11zm.257-17.622a2.25 2.25 0 0 0-2.013 0L4.037 5.893a2.25 2.25 0 0 0-1.244 2.013v8.189a2.25 2.25 0 0 0 1.244 2.012l6.957 3.479.336-.671-.336.67a2.25 2.25 0 0 0 2.013 0l6.957-3.478a2.25 2.25 0 0 0 1.244-2.012v-8.19a2.25 2.25 0 0 0-1.244-2.012z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgBoxCube
