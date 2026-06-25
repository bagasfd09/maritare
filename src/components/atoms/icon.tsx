// Stroke-based inline icon set, ported 1:1 from the dashboard design.
// Single source of truth so every screen draws from the same glyphs.
export type IconName =
  | "home" | "edit" | "users" | "heart" | "image" | "envelope" | "template"
  | "card" | "settings" | "search" | "plus" | "arrow-r" | "arrow-ur" | "arrow-d"
  | "chevron-d" | "chevron-r" | "external" | "bell" | "check" | "x" | "more"
  | "filter" | "upload" | "download" | "qr" | "link" | "copy" | "music"
  | "calendar" | "pin" | "globe" | "wa" | "eye" | "sparkle" | "grip" | "list" | "share" | "logout"
  | "user";

type IconProps = {
  name: IconName;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
};

export function Icon({ name, size = 16, stroke = "currentColor", strokeWidth = 1.6, className }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    // Icons are decorative — labels live on the parent control. Hide from AT and
    // keep them out of the tab order (legacy IE/Edge focusable SVG).
    "aria-hidden": true as const,
    focusable: false as const,
    className: cnShrink(className),
  };
  switch (name) {
    case "home": return (<svg {...common}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>);
    case "edit": return (<svg {...common}><path d="M14 4l6 6L10 20H4v-6L14 4z" /></svg>);
    case "users": return (<svg {...common}><circle cx="9" cy="9" r="3.5" /><path d="M3 20c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5" /><circle cx="17" cy="8" r="2.5" /><path d="M15 20c0-2.4 1.6-4.5 4-5" /></svg>);
    case "user": return (<svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" /></svg>);
    case "heart": return (<svg {...common}><path d="M12 21s-7-4.5-9-9.5C1.6 7 4 4 7 4c1.7 0 3.2 1 4 2 0.8-1 2.3-2 4-2 3 0 5.4 3 4 7.5C19 16.5 12 21 12 21z" /></svg>);
    case "image": return (<svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="M21 16l-6-5-10 9" /></svg>);
    case "envelope": return (<svg {...common}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 8l9 6 9-6" /></svg>);
    case "template": return (<svg {...common}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /></svg>);
    case "card": return (<svg {...common}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></svg>);
    case "settings": return (<svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19 12c0 .5 0 1 0 1.5l2 1.5-2 3.5-2.4-1c-.8.6-1.6 1-2.6 1.4L13.5 22h-3l-.5-2c-1-.4-1.8-.8-2.6-1.4l-2.4 1L3 16l2-1.5C5 14 5 13.5 5 13s0-1 0-1.5L3 10l2-3.5 2.4 1c.8-.6 1.6-1 2.6-1.4L10.5 4h3l.5 2c1 .4 1.8.8 2.6 1.4l2.4-1L21 9.9 19 11.5c0 .5 0 1 0 1.5z" /></svg>);
    case "search": return (<svg {...common}><circle cx="11" cy="11" r="7" /><path d="M21 21l-5-5" /></svg>);
    case "plus": return (<svg {...common}><path d="M12 5v14M5 12h14" /></svg>);
    case "arrow-r": return (<svg {...common}><path d="M5 12h14M13 5l7 7-7 7" /></svg>);
    case "arrow-ur": return (<svg {...common}><path d="M7 17L17 7M9 7h8v8" /></svg>);
    case "arrow-d": return (<svg {...common}><path d="M12 5v14M5 13l7 7 7-7" /></svg>);
    case "chevron-d": return (<svg {...common}><path d="M6 9l6 6 6-6" /></svg>);
    case "chevron-r": return (<svg {...common}><path d="M9 6l6 6-6 6" /></svg>);
    case "external": return (<svg {...common}><path d="M14 4h6v6M20 4L10 14M16 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6" /></svg>);
    case "bell": return (<svg {...common}><path d="M18 16v-5a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2zM10 21a2 2 0 004 0" /></svg>);
    case "check": return (<svg {...common}><path d="M5 12l5 5L20 7" /></svg>);
    case "x": return (<svg {...common}><path d="M6 6l12 12M6 18L18 6" /></svg>);
    case "more": return (<svg {...common}><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></svg>);
    case "filter": return (<svg {...common}><path d="M3 5h18M6 12h12M10 19h4" /></svg>);
    case "upload": return (<svg {...common}><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></svg>);
    case "download": return (<svg {...common}><path d="M12 4v12M6 10l6 6 6-6M4 20h16" /></svg>);
    case "qr": return (<svg {...common}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h4M14 21h3M21 17v4" /></svg>);
    case "link": return (<svg {...common}><path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" /><path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" /></svg>);
    case "copy": return (<svg {...common}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></svg>);
    case "music": return (<svg {...common}><path d="M9 18V6l10-2v12" /><circle cx="7" cy="18" r="2.5" /><circle cx="17" cy="16" r="2.5" /></svg>);
    case "calendar": return (<svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>);
    case "pin": return (<svg {...common}><path d="M12 22s-7-7-7-13a7 7 0 1114 0c0 6-7 13-7 13z" /><circle cx="12" cy="9" r="2.5" /></svg>);
    case "globe": return (<svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></svg>);
    case "wa": return (<svg {...common}><path d="M21 12a9 9 0 11-3.5-7.1L21 4l-1 3.5A9 9 0 0121 12z" /><path d="M9 10c0 4 3 7 7 7l1-2-3-1-1 1c-1 0-3-2-3-3l1-1-1-3-2 1z" /></svg>);
    case "eye": return (<svg {...common}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>);
    case "sparkle": return (<svg {...common}><path d="M12 3v18M3 12h18M6 6l12 12M6 18L18 6" /></svg>);
    case "grip": return (<svg {...common}><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></svg>);
    case "list": return (<svg {...common}><path d="M4 6h16M4 12h16M4 18h16" /></svg>);
    case "share": return (<svg {...common}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M9 11l6-4M9 13l6 4" /></svg>);
    case "logout": return (<svg {...common}><path d="M15 4H6a2 2 0 00-2 2v12a2 2 0 002 2h9" /><path d="M11 12h10M18 9l3 3-3 3" /></svg>);
    default: return null;
  }
}

// Icons must never flex-shrink inside flex rows.
function cnShrink(className?: string) {
  return className ? `shrink-0 ${className}` : "shrink-0";
}
