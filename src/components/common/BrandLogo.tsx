import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  asLink?: boolean;
}

export function BrandLogo({
  className,
  size = "md",
  withTagline = false,
  asLink = true,
}: BrandLogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-3 select-none group", className)}>
      {/* Brand Icon: Picture Frame + Layered Image + Sparkle Symbol */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl p-2 transition-transform duration-300 group-hover:scale-105",
          "bg-gradient-to-br from-[#FFF0F7] via-[#F5EEFF] to-[#E9DDF7] border border-[#E9DDF7] shadow-sm",
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Layered photo background card */}
          <rect
            x="4"
            y="7"
            width="22"
            height="22"
            rx="5"
            transform="rotate(-8 4 7)"
            fill="#F472B6"
            fillOpacity="0.28"
            stroke="#EC4899"
            strokeWidth="1.5"
          />
          {/* Main photo frame */}
          <rect
            x="7"
            y="6"
            width="23"
            height="23"
            rx="5.5"
            fill="url(#pixora-logo-grad)"
            stroke="#9333EA"
            strokeWidth="1.6"
          />
          {/* Inner landscape hills */}
          <path
            d="M9 23L14.5 16.5L19 21.5L23.5 15L28 21.5V26C28 27.1 27.1 28 26 28H11C9.9 28 9 27.1 9 26V23Z"
            fill="#FFFFFF"
            fillOpacity="0.88"
          />
          {/* Shimmer sparkle */}
          <path
            d="M26 4L26.8 6.2L29 7L26.8 7.8L26 10L25.2 7.8L23 7L25.2 6.2L26 4Z"
            fill="#EC4899"
          />
          <circle cx="13" cy="12" r="2.2" fill="#FFFFFF" />

          <defs>
            <linearGradient
              id="pixora-logo-grad"
              x1="7"
              y1="6"
              x2="30"
              y2="29"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#9333EA" />
              <stop offset="1" stopColor="#6D28D9" />
            </linearGradient>
          </defs>
        </svg>

        {/* Small ambient glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl blur-sm opacity-20 -z-10 group-hover:opacity-40 transition-opacity" />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-bold tracking-tight text-[#241735]",
              textSizes[size]
            )}
          >
            Pixora<span className="text-[#9333EA]">.</span>
            <span className="pixora-gradient-text">AI</span>
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[#FFF0F7] text-[#EC4899] border border-[#F472B6]/30">
            Smart
          </span>
        </div>
        {withTagline && (
          <span className="text-xs text-[#7A6A88] font-medium tracking-normal">
            Every memory, beautifully organized.
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link href="/dashboard" className="outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}

