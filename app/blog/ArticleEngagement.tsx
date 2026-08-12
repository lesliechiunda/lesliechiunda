"use client";

import { useCallback, useEffect, useState } from "react";

export default function ArticleEngagement({ articleId, title }: { articleId: string; title: string }) {
  const [message, setMessage] = useState("");

  const record = useCallback(async (event: "view" | "read" | "share") => {
    try {
      await fetch(`/api/articles/${articleId}/analytics`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event }),
        keepalive: true,
      });
    } catch {
      // Analytics must never interrupt reading or sharing.
    }
  }, [articleId]);

  useEffect(() => {
    const viewKey = `article-view:${articleId}`;
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, "1");
      void record("view");
    }

    const readKey = `article-read:${articleId}`;
    const markRead = () => {
      if (sessionStorage.getItem(readKey)) return;
      const page = document.documentElement;
      const progress = (window.scrollY + window.innerHeight) / Math.max(page.scrollHeight, 1);
      if (progress < 0.72) return;
      sessionStorage.setItem(readKey, "1");
      void record("read");
      window.removeEventListener("scroll", markRead);
    };
    window.addEventListener("scroll", markRead, { passive: true });
    markRead();
    return () => window.removeEventListener("scroll", markRead);
  }, [articleId, record]);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Read “${title}” by Leslie Chiunda.`, url });
        await record("share");
        setMessage("Shared");
      } catch {
        // Closing the native share sheet is not an error worth showing.
      }
      return;
    }
    await copy();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      await record("share");
      setMessage("Link copied");
    } catch {
      setMessage("Copy the address from your browser");
    }
  }

  return <div className="article-engagement" aria-label="Share this article">
    <button type="button" onClick={share}>Share article <span>↗</span></button>
    <button type="button" onClick={copy}>Copy link <span>⧉</span></button>
    <small aria-live="polite">{message}</small>
  </div>;
}
