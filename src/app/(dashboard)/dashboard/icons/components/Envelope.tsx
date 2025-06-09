import * as React from 'react'
import type { SVGProps } from 'react'
const SvgEnvelope = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3.042 7.062v7.313a.5.5 0 0 0 .5.5h12.916a.5.5 0 0 0 .5-.5V7.062l-5.814 4.055a2 2 0 0 1-2.288 0zm13.916-1.87V5.2a.07.07 0 0 1-.03.055l-6.642 4.631a.5.5 0 0 1-.572 0L3.072 5.255a.071.071 0 0 1 .041-.13h13.774c.038 0 .07.03.071.068m1.5.022v9.161a2 2 0 0 1-2 2H3.542a2 2 0 0 1-2-2v-9.21a1.57 1.57 0 0 1 1.571-1.54h13.774c.868 0 1.571.703 1.571 1.571z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgEnvelope
