import type { SVGProps } from "react";

function IconBase({ children, className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4 12h6V4H4v8Z" />
      <path d="M14 20h6v-6h-6v6Z" />
      <path d="M14 4h6v8h-6V4Z" />
      <path d="M4 20h6v-6H4v6Z" />
    </IconBase>
  );
}

export function AvailabilityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
      <path d="M8 5v4" />
      <path d="M12 10v4" />
      <path d="M16 15v4" />
    </IconBase>
  );
}

export function OrdersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M6 4h12l2 5-2 11H6L4 9l2-5Z" />
      <path d="M9 10h6" />
      <path d="M9 14h4" />
    </IconBase>
  );
}

export function ProductsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 3 4.5 7.2 12 11.5l7.5-4.3L12 3Z" />
      <path d="M4.5 7.2V16.8L12 21l7.5-4.2V7.2" />
      <path d="M12 11.5V21" />
    </IconBase>
  );
}

export function ContainersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4 8h16" />
      <path d="M5 8l2 12h10l2-12" />
      <path d="M9 4h6l1 4H8l1-4Z" />
      <path d="M10 12h4" />
    </IconBase>
  );
}

export function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
      <path d="m19 13-.8 1.4.1 1.8-1.8 1.8-1.8-.1-1.4.8-1.3 1.8-2.4.1-1.3-1.8-1.4-.8-1.8.1-1.8-1.8.1-1.8L5 13l-.1-2.4L5 9l1.8-1.8 1.8.1 1.4-.8 1.3-1.8 2.4-.1 1.3 1.8 1.4.8 1.8-.1L19 9l-.1 1.8L19 13Z" />
    </IconBase>
  );
}

export function InventoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4 8h16" />
      <path d="M6 8v10h12V8" />
      <path d="M9 8V5h6v3" />
      <path d="M9 12h6" />
    </IconBase>
  );
}

export function IncomingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4 14h10" />
      <path d="m10 8 4 4-4 4" />
      <path d="M14 5h4v14h-4" />
    </IconBase>
  );
}

export function AlertIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 4 3.8 18h16.4L12 4Z" />
      <path d="M12 9v4" />
      <path d="M12 16h.01" />
    </IconBase>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 6v6l4 2" />
      <circle cx="12" cy="12" r="8" />
    </IconBase>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="m5 12 4 4 10-10" />
    </IconBase>
  );
}

export function ArrowUpRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </IconBase>
  );
}

export function ShipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M8 5h8l1 5H7l1-5Z" />
      <path d="M6 10h12l-1 6H7L6 10Z" />
      <path d="M5 18h14" />
    </IconBase>
  );
}
