"use client";
import { useState } from "react";
import { supabase } from "@/app/_lib/supabaseClient";
import Image from "next/image";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = async () => {
    setLoading(true);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center space-y-6">
        <h1 className="text-2xl font-semibold">Smart Bookmark App</h1>
        <p className="text-gray-500 text-sm">Sign in to manage your bookmarks</p>
        <button
          type="button"
          onClick={loginWithGoogle}
          disabled={loading}
          className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition disabled:opacity-60"
        >
          <Image src="/google-color.svg" alt="Google" width={20} height={20} />
          <span className="text-gray-700 font-medium">{loading ? "Signing in..." : "Continue with Google"}</span>
        </button>
      </div>
    </main>
  );
}
