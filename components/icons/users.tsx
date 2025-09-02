import type { SVGProps } from "react"

const UsersIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <path
      fill="currentColor"
      d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM7 9a5 5 0 0 0-5 5v1h10v-1a5 5 0 0 0-5-5ZM14.5 13a3.5 3.5 0 0 0-3.5 3.5V17h7v-.5a3.5 3.5 0 0 0-3.5-3.5Z"
    />
  </svg>
)

export default UsersIcon
