"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/common/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import { usePhotoStore } from "@/lib/store/photo-store";
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setIsDemoMode } = usePhotoStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setIsDemoMode(false);
        setUser((prev) => ({
          ...prev,
          id: data.user.id,
          email: data.user.email || email,
          display_name: data.user.user_metadata?.display_name || "Curator",
          is_demo: false,
        }));
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnterDemo = () => {
    setIsDemoMode(true);
    setUser((prev) => ({
      ...prev,
      id: "demo-user-1",
      email: "creator@pixora.ai",
      display_name: "Creative Explorer",
      is_demo: true,
    }));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FCFAFF] flex flex-col justify-center items-center p-4 selection:bg-[#F5EEFF] selection:text-[#9333EA]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <BrandLogo size="lg" withTagline={true} />
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-white border border-[#E9DDF7] shadow-xl space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-extrabold text-[#241735]">
              Welcome Back
            </h1>
            <p className="text-xs text-[#7A6A88]">
              Sign in to access your private organized visual library.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#241735] block mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-[#A398AF]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-[#FCFAFF] border border-[#E9DDF7] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9333EA]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#241735]">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-[#A398AF]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-[#FCFAFF] border border-[#E9DDF7] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9333EA]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#EC4899] to-[#9333EA] hover:brightness-105 active:scale-98 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In to Pixora"}
            </button>
          </form>

          {/* Quick Demo Mode Button */}
          <div className="pt-2 border-t border-[#E9DDF7] text-center space-y-3">
            <button
              type="button"
              onClick={handleEnterDemo}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-[#6D28D9] bg-[#F5EEFF] hover:bg-[#E9DDF7] border border-[#E9DDF7] transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
              <span>Explore in Guest / Demo Mode</span>
            </button>
            <p className="text-[11px] text-[#A398AF]">
              Instant access with preloaded sample photos, smart albums & AI tools.
            </p>
          </div>

          <div className="text-center text-xs text-[#7A6A88]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-[#9333EA] hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

