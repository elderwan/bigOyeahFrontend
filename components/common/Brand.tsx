"use client";

import Image from "next/image";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`}>
      <Image className="brand-logo" src="/fitbooking-kettlebell.png" width={34} height={30} alt="" priority />
      <span>FitBooking<span className="brand-period">.</span></span>
    </div>
  );
}
