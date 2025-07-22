'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

// Dynamically import swagger-ui-react with no SSR
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
})

export default function SwaggerDocPage() {
  return <SwaggerUI url="/api-doc/swagger.json" />
}
