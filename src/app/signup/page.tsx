"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/common/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import { usePhotoStore } from "@/lib/store/photo-store";
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { setUser, setIsDemoMode } = usePhotoStore();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
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
          id: data.user!.id,
          email,
          display_name: displayName || "Curator",
          is_demo: false,
        }));
        setSuccessMsg("Account created! Redirecting to your visual library...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAFF] flex flex-col justify-center items-center p-4 selection:bg-[#F5EEFF] selection:text-[#9333EA]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo size="lg" withTagline={true} />
        </div>

        <div className="p-8 rounded-3xl bg-white border border-[#E9DDF7] shadow-xl space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-extrabold text-[#241735]">
              Create Your Pixora Library
            </h1>
            <p className="text-xs text-[#7A6A88]">
              Turn scattered images into a private, AI-organized visual gallery.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#241735] block mb-1">
                Your Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-[#A398AF]" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Creative Explorer"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-[#FCFAFF] border border-[#E9DDF7] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9333EA]"
                />
              </div>
            </div>

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
              <label className="text-xs font-semibold text-[#241735] block mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-[#A398AF]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-[#FCFAFF] border border-[#E9DDF7] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9333EA]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#EC4899] to-[#9333EA] hover:brightness-105 active:scale-98 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="text-center text-xs text-[#7A6A88]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#9333EA] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

