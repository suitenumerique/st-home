import HexPattern from "@/components/HexPattern";
import { ReactNode } from "react";

// import dynamic from "next/dynamic";
// const HexPattern = dynamic(() => import("@/components/HexPattern"), {
//   ssr: false,
// });

interface HeroSectionProps {
  children: ReactNode;
}

export default function HeroSection({ children }: HeroSectionProps) {
  return (
    <section
      style={{
        position: "relative",
        backgroundColor: "var(--background-alt-blue-france)",
        backgroundImage: `
          radial-gradient(50% 50% at 0% 0%, rgba(201, 25, 30, 0.05) 0%, rgba(201, 25, 30, 0) 100%),
          linear-gradient(180deg, rgba(0, 0, 145, 0.03) 0%, rgba(205, 200, 255, 0) 60%),
          radial-gradient(50% 50% at 100% 100%, rgba(201, 25, 30, 0.05) 0%, rgba(201, 25, 30, 0) 100%)
        `,
        overflow: "hidden",
      }}
    >
      <HexPattern />
      <div style={{ zIndex: 1, position: "relative" }}>{children}</div>
    </section>
  );
}
