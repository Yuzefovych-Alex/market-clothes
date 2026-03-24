"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/api";
import { getOrCreateVisitorId } from "@/lib/visitor";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    const path = pathname || "/";
    if (last.current === path) return;
    last.current = path;
    const vid = getOrCreateVisitorId();
    if (!vid) return;
    void trackPageView(vid, path);
  }, [pathname]);

  return null;
}
