"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";
import { AUTHOR_NAME, isAuthorizedOwner } from "@/app/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && isAuthorizedOwner(data.user.email)) {
        window.location.assign("/studio");
      }
    });
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        const isInvalidCredentials =
          error.message.toLowerCase().includes("invalid login credentials") ||
          error.code === "invalid_credentials";

        setErrorMsg(
          isInvalidCredentials
            ? "This is not for users only admin can login and edit"
            : error.message
        );
        setSubmitting(false);
        return;
      }

      if (!isAuthorizedOwner(data.user?.email)) {
        await supabase.auth.signOut();
        setErrorMsg(
          `Access is restricted to the single author account for ${AUTHOR_NAME}.`
        );
        setSubmitting(false);
        return;
      }

      window.location.assign("/studio");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Unable to sign in right now."
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
          Author Access
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          Sign in to Studio
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          Publishing is restricted to {AUTHOR_NAME}. Visitors can read all
          chapters, topics, and concepts without logging in.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@outlook.com"
              className="mt-1.5 w-full rounded-md border border-white/15 bg-[#131212] px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-sky-400 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-md border border-white/15 bg-[#131212] px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-sky-400 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="rounded-md border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300"
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4 text-center">
          <Link
            href="/"
            className="text-xs text-sky-400 transition hover:underline"
          >
            ← Go back to main page
          </Link>
        </div>
      </div>
    </main>
  );
}