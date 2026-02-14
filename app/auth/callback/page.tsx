"use client";
import { useEffect } from "react";
import { supabase } from "@/app/_lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      router.replace("/dashboard");
    });
  }, [router]);

  return <p className="p-6">Signing you in...</p>;
}
