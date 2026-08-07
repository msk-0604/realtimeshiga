"use client";

import { useEffect } from "react";
import { recordViewAction } from "@/lib/social/actions";

export function ViewRecorder({ postId }: { postId: string }) {
  useEffect(() => {
    void recordViewAction(postId);
  }, [postId]);
  return null;
}
