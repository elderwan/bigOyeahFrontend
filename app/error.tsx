"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("FitBooking page failed to render:", error);
  }, [error]);

  return (
    <main className="app-error-screen">
      <div className="app-error-content">
        <p className="eyebrow">FITBOOKING</p>
        <h1>This page didn’t load.</h1>
        <p>Try again. If the problem continues, return to the home page and reopen this screen.</p>
        <div className="app-error-actions">
          <button className="button button-primary" onClick={() => reset()}>Try again</button>
          <a className="button button-outline" href="/">Go to home</a>
        </div>
      </div>
    </main>
  );
}
