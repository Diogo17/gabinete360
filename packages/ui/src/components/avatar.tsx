import * as React from "react";
import { cn } from "../lib/utils";

export const AVATAR_PALETTES = [
  { bg: "#d6e5dd", text: "#176b52" }, // Mint / Green (User logado)
  { bg: "#e4c9aa", text: "#63492f" }, // Warm Amber / Brown (Mariana Costa)
  { bg: "#dce6ed", text: "#496b83" }, // Soft Blue / Slate (Rafael Lima)
  { bg: "#e8ded3", text: "#69513d" }, // Sand / Bronze (Ana Souza)
  { bg: "#e8e8d6", text: "#696941" }, // Olive / Khaki (Equipe)
];

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  initials?: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg";
  paletteIndex?: number;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, name, initials, src, size = "md", paletteIndex, style, ...props }, ref) => {
    const computedInitials = React.useMemo(() => {
      if (initials) return initials.slice(0, 2).toUpperCase();
      if (!name) return "??";
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return ((parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }, [name, initials]);

    const palette = React.useMemo(() => {
      if (paletteIndex !== undefined) {
        return AVATAR_PALETTES[paletteIndex % AVATAR_PALETTES.length];
      }
      // Hash name to pick consistent palette
      let hash = 0;
      const str = name || computedInitials;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % AVATAR_PALETTES.length;
      return AVATAR_PALETTES[idx];
    }, [name, computedInitials, paletteIndex]);

    return (
      <div
        ref={ref}
        style={{
          backgroundColor: palette?.bg,
          color: palette?.text,
          ...style,
        }}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center rounded-full font-bold select-none overflow-hidden",
          size === "xs" && "h-[23px] w-[23px] text-[9px]",
          size === "sm" && "h-[30px] w-[30px] text-[11px]",
          size === "md" && "h-[34px] w-[34px] text-xs",
          size === "lg" && "h-[42px] w-[42px] text-sm",
          className
        )}
        title={name}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name || "Avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{computedInitials}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";
