import PlainLink from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Link as LocaleLink } from "@/i18n/navigation";

// Routes outside the [locale] tree (/admin, /api) must never get a locale
// prefix; everything else goes through the locale-aware Link so buttons stay
// on the current language automatically.
function isUnlocalizedPath(href: string): boolean {
  return href.startsWith("/admin") || href.startsWith("/api");
}

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-green text-black hover:bg-green-soft shadow-[0_0_24px_rgba(0,255,102,0.25)]",
  outline:
    "border border-border text-foreground hover:border-green hover:text-green",
  ghost: "text-foreground hover:text-green",
  danger: "bg-red-500 text-white hover:bg-red-400",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide uppercase transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

export default function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

  if ("href" in props && props.href) {
    const LinkComponent = isUnlocalizedPath(props.href) ? PlainLink : LocaleLink;
    return (
      <LinkComponent href={props.href} className={classes} target={props.target} rel={props.rel}>
        {children}
      </LinkComponent>
    );
  }

  const rest = { ...props } as Record<string, unknown>;
  delete rest.href;
  delete rest.variant;
  delete rest.size;
  delete rest.className;
  delete rest.children;

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
