"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { isAuthorizedOwner } from "@/app/lib/auth";

export function Navbar() {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setIsOwner(isAuthorizedOwner(data.user?.email));
      setCheckedAuth(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsOwner(isAuthorizedOwner(session?.user?.email));
      setCheckedAuth(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsOwner(false);
    setMenuOpen(false);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#131212]/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex min-w-0 flex-col"
          >
            <span className="truncate text-base font-semibold tracking-tight text-white">
              Math Archive
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-5 text-sm text-zinc-300 sm:flex"
          >
            <Link
              href="/#who-is-this-for"
              className="transition hover:text-sky-400"
            >
              Who Is This For?
            </Link>
            <Link href="/#chapters" className="transition hover:text-sky-400">
              Chapters
            </Link>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {checkedAuth && isOwner ? (
            <>
              <Link
                href="/studio"
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-9 items-center rounded-md bg-sky-500 px-3 py-1.5 text-xs font-medium text-zinc-950 transition hover:bg-sky-400 sm:px-3.5"
              >
                Studio
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-9 items-center rounded-md border border-white/15 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/35 hover:text-white sm:px-3"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="inline-flex min-h-9 items-center rounded-md border border-white/15 px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-sky-400/60 hover:text-sky-400"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-zinc-200 transition hover:border-sky-400/60 hover:text-sky-400 sm:hidden"
          >
            {menuOpen ? (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav-menu"
          aria-label="Mobile Navigation"
          className="border-t border-white/10 bg-[#131212] px-4 py-3 sm:hidden"
        >
          <div className="flex flex-col space-y-1 text-sm text-zinc-200">
            <Link
              href="/#who-is-this-for"
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-2.5 transition hover:bg-white/[0.04] hover:text-sky-400"
            >
              Who Is This For?
            </Link>
            <Link
              href="/#chapters"
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-2.5 transition hover:bg-white/[0.04] hover:text-sky-400"
            >
              Chapters
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}