"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/shared/config/nav";

export function NavList() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_LINKS.map((link) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-m px-3 py-2 text-label-m ${
              isActive
                ? "bg-brand-weak text-brand font-semibold"
                : "text-grey-700 hover:bg-grey-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
