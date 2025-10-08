import type { SVGProps } from 'react';

export const Icons = {
  Logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 22V13.91C6 13.41 6.4 13 6.9 13H17.1C17.6 13 18 13.41 18 13.91V22" />
      <path d="M18 9.69L12 3 6 9.69" />
      <path d="M10 22V17.5C10 16.67 10.67 16 11.5 16H12.5C13.33 16 14 16.67 14 17.5V22" />
    </svg>
  ),
};
