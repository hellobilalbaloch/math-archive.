"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { AUTHOR_NAME, isAuthorizedOwner } from "@/app/lib/auth";

export function Navbar() {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

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
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#131212]/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-white">
              Math Archive
            </span>
            <span className="text-[11px] text-zinc-400">
              
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-zinc-300 sm:flex">
            <Link href="/#who-is-this-for" className="transition hover:text-white">
              Who Is This For?
            </Link>
            <Link href="/#chapters" className="transition hover:text-white">
              Chapters
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {checkedAuth && isOwner ? (
            <>
              <Link
                href="/studio"
                className="rounded-md bg-sky-500 px-3.5 py-1.5 text-xs font-medium text-zinc-950 transition hover:bg-sky-400"
              >
                Studio
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/35 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-white/15 px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-sky-400/60 hover:text-sky-400"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}