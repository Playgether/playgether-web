import Image from "next/image";
import { cn } from "@/lib/utils";

const HORIZONTAL = { width: 1800, height: 440 };
const VERTICAL = { width: 1300, height: 850 };
const ICON = { width: 512, height: 512 };

const LOGO_ASSETS = {
  horizontal: {
    color: {
      src: "/logo-principal/playgather-logo-principal.svg",
      ...HORIZONTAL,
    },
    white: { src: "/branca/playgather-logo-branca.svg", ...HORIZONTAL },
    black: { src: "/preta/playgather-logo-preta.svg", ...HORIZONTAL },
  },
  vertical: {
    color: {
      src: "/logo-vertical/playgather-logo-original-vertical.svg",
      ...VERTICAL,
    },
    white: {
      src: "/logo-vertical/playgather-logo-vertical-branca.svg",
      ...VERTICAL,
    },
    black: {
      src: "/logo-vertical/playgather-logo-vertical-preta.svg",
      ...VERTICAL,
    },
  },
  icon: {
    color: { src: "/icone-principal/playgather-icone.svg", ...ICON },
    white: { src: "/icone-principal/playgather-icone-branco.svg", ...ICON },
    black: { src: "/icone-principal/playgather-icone-preto.svg", ...ICON },
  },
} as const;

type BrandLogoVariant = keyof typeof LOGO_ASSETS;
type BrandLogoTone = "auto" | "mono" | "color" | "white" | "black";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  /**
   * `auto` shows the colored logo in light mode and the white one in dark mode.
   * `mono` shows the black logo in light mode and the white one in dark mode.
   */
  tone?: BrandLogoTone;
  className?: string;
  priority?: boolean;
  alt?: string;
}

export function BrandLogo({
  variant = "horizontal",
  tone = "auto",
  className,
  priority,
  alt = "Playgether",
}: BrandLogoProps) {
  const assets = LOGO_ASSETS[variant];

  if (tone !== "auto" && tone !== "mono") {
    const asset = assets[tone];
    return (
      <Image
        src={asset.src}
        alt={alt}
        width={asset.width}
        height={asset.height}
        className={cn("object-contain", className)}
        priority={priority}
      />
    );
  }

  const light = tone === "mono" ? assets.black : assets.color;

  return (
    <>
      <Image
        src={light.src}
        alt={alt}
        width={light.width}
        height={light.height}
        className={cn("object-contain", className, "dark:hidden")}
        priority={priority}
      />
      <Image
        src={assets.white.src}
        alt={alt}
        width={assets.white.width}
        height={assets.white.height}
        className={cn("object-contain", className, "hidden dark:block")}
        priority={priority}
      />
    </>
  );
}
