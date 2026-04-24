"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SavedBuildActionsProps = {
  projectId: string;
  shareId: string;
  isPublic: boolean;
};

export function SavedBuildActions({ projectId, shareId, isPublic }: SavedBuildActionsProps) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const buildPath = `/p/${shareId}`;

  async function copyShareLink() {
    const shareUrl = `${window.location.origin}${buildPath}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice("Share link copied.");
    } catch {
      setNotice("Unable to copy automatically. Copy the Open Build URL instead.");
    }
  }

  async function deleteBuild() {
    const confirmed = window.confirm("Delete this saved build from your account?");
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/builds/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Delete failed");
      }

      setNotice("Build deleted.");
      router.refresh();
    } catch {
      setNotice("Unable to delete build. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="action-row" style={{ marginTop: 10 }}>
        <a className="button-ghost" href={buildPath}>
          Open Build
        </a>
        {isPublic ? (
          <button type="button" className="button-ghost" onClick={copyShareLink}>
            Copy Share Link
          </button>
        ) : null}
        <a className="button-ghost" href={`/api/export/${shareId}`}>
          Export JSON
        </a>
        <a className="button-ghost" href={`/api/export/${shareId}/quote`} target="_blank" rel="noreferrer">
          Export PDF
        </a>
        <button type="button" className="button-ghost" onClick={deleteBuild} disabled={deleting}>
          {deleting ? "Deleting..." : "Delete Build"}
        </button>
      </div>
      {notice ? <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>{notice}</p> : null}
    </>
  );
}
