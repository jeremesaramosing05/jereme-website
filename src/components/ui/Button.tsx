import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  download?: boolean;
  external?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm tracking-wide transition-all duration-300";

const variants = {
  primary:
    "bg-foreground text-background hover:bg-accent-strong hover:-translate-y-0.5",
  ghost:
    "border border-line text-foreground hover:border-accent hover:text-accent hover:-translate-y-0.5",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  download,
  external,
}: ButtonLinkProps) {
  const className = `${base} ${variants[variant]}`;

  if (download || external) {
    return (
      <a
        href={href}
        className={className}
        download={download}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
