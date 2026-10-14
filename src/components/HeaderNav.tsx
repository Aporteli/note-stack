"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Boards" },
  { href: "/flash-cards", label: "Flash cards", short: "Cards" },
  { href: "/quizzes", label: "Quiz" },
  { href: "/week", label: "Week" },
];

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto" aria-label="Workspace">
      {NAV.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
              active
                ? "bg-surface text-ink"
                : "text-ink-soft hover:bg-surface hover:text-ink"
            }`}
          >
            {"short" in item && item.short ? (
              <>
                <span className="sm:hidden">{item.short}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </>
            ) : (
              item.label
            )}
          </Link>
        );
      })}
    </nav>
  );
}
