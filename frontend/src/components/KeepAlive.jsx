import { useEffect, useRef } from "react";
import api from "../lib/api";

// Keep-alive: pings backend every 10 minutes while any tab is open.
// Prevents Render free tier from sleeping when at least one teacher is using the site.
export default function KeepAlive() {
  const timerRef = useRef(null);

  useEffect(() => {
    const ping = () => {
      api.get("/").catch(() => {});
    };

    // Warm immediately on load (helps very first visitor of the day)
    ping();

    // Then every 10 minutes
    timerRef.current = setInterval(ping, 10 * 60 * 1000);

    // Also ping when tab becomes visible again
    const onVisibility = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
