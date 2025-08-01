import React from 'react'
import { CardDescription, CardTitle } from '../../ui/card'
import Link from 'next/link'

export default function CardIconTwo() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div>
        <div
          className="mb-5 flex h-14 max-w-14 items-center justify-center rounded-[10.5px] bg-brand-50 text-brand-500 dark:bg-brand-500/10">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.6147 4.39464C13.8572 4.2734 14.1426 4.2734 14.385 4.39464L21.8797 8.14188L14.3973 11.883C14.1471 12.0081 13.8526 12.0081 13.6024 11.883L6.11997 8.14188L13.6147 4.39464ZM5.02148 9.57978V18.7772C5.02148 19.1035 5.20581 19.4017 5.49762 19.5476L13.1109 23.3542V13.6016C13.0079 13.5652 12.9066 13.5222 12.8076 13.4727L5.02148 9.57978ZM14.8883 23.3544L22.5021 19.5476C22.7939 19.4017 22.9782 19.1035 22.9782 18.7772V9.57978L15.1921 13.4727C15.0929 13.5223 14.9915 13.5653 14.8883 13.6018L14.8883 23.3544ZM14.7825 3.59978L15.1799 2.80493C14.437 2.43351 13.5627 2.43351 12.8198 2.80493L4.70279 6.86333C3.80884 7.3103 3.24414 8.22398 3.24414 9.22344V18.7772C3.24414 19.7767 3.80883 20.6904 4.70279 21.1373L12.8198 25.1958L13.2172 24.4009L12.8198 25.1958C13.5627 25.5672 14.437 25.5672 15.1799 25.1958L23.2969 21.1373C24.1909 20.6904 24.7556 19.7767 24.7556 18.7772V9.22344C24.7556 8.22398 24.1909 7.3103 23.2969 6.86333L15.1799 2.80493L14.7825 3.59978Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <CardTitle>Card title</CardTitle>

        <CardDescription>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi
          architecto aspernatur cum et ipsum
        </CardDescription>

        <Link
          href="/"
          className="inline-flex items-center gap-1 mt-4 text-sm text-brand-500 hover:text-brand-600"
        >
          Read more
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M14.0836 7.99888C14.0838 8.19107 14.0107 8.38334 13.8641 8.53001L9.86678 12.5301C9.57399 12.8231 9.09911 12.8233 8.80612 12.5305C8.51312 12.2377 8.51296 11.7629 8.80575 11.4699L11.526 8.74772L2.66602 8.74772C2.2518 8.74772 1.91602 8.41194 1.91602 7.99772C1.91602 7.58351 2.2518 7.24772 2.66602 7.24772L11.5216 7.24772L8.80576 4.53016C8.51296 4.23718 8.51311 3.7623 8.8061 3.4695C9.09909 3.1767 9.57396 3.17685 9.86676 3.46984L13.8292 7.43478C13.9852 7.57222 14.0836 7.77348 14.0836 7.99772C14.0836 7.99811 14.0836 7.9985 14.0836 7.99888Z"
              fill="currentColor"
            />
          </svg>
        </Link>
      </div>
    </div>
  )
}
