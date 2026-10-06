"use client";

import { useEffect } from "react";
import { captureFirstTouch } from "@/features/attribution/client";

/** Records first-touch UTM/landing data in sessionStorage. No cookies, no third parties. */
export function AttributionCapture() {
  useEffect(() => {
    captureFirstTouch();
  }, []);
  return null;
}
