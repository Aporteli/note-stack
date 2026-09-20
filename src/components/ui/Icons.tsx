import type { SVGProps } from "react";

/**
 * Hand-rolled 20px icon set — 1.6px strokes, round caps, so icons sit at the
 * same optical weight as Public Sans 600. No icon library needed.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 4.5v11M4.5 10h11" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
  </Svg>
);

export const IconMore = (p: IconProps) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M5 10h.01M10 10h.01M15 10h.01" />
  </Svg>
);

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="9" r="5.25" />
    <path d="M13 13l3.5 3.5" />
  </Svg>
);

export const IconBack = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4.5L6.5 10l5.5 5.5" />
  </Svg>
);

export const IconStack = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 2.75l6.5 3.25L10 9.25 3.5 6l6.5-3.25z" />
    <path d="M3.5 10l6.5 3.25L16.5 10" />
    <path d="M3.5 14l6.5 3.25L16.5 14" />
  </Svg>
);

export const IconDescription = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 6h11M4.5 10h11M4.5 14h6.5" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10" cy="10" r="6.5" />
    <path d="M10 6.5V10l2.5 1.75" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 10.5l3.5 3.5 7.5-8" />
  </Svg>
);

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6h12M8 6V4.5h4V6M6 6l.75 9.5h6.5L14 6" />
  </Svg>
);

export const IconPencil = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13.5 3.5l3 3L7 16H4v-3l9.5-9.5z" />
  </Svg>
);

export const IconGrip = (p: IconProps) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M7.5 5h.01M12.5 5h.01M7.5 10h.01M12.5 10h.01M7.5 15h.01M12.5 15h.01" />
  </Svg>
);

export const IconFilter = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 5.5h13M6 10h8M8.5 14.5h3" />
  </Svg>
);

export const IconAlert = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 3.75l6.5 12h-13l6.5-12z" />
    <path d="M10 8.5v3M10 14h.01" />
  </Svg>
);
