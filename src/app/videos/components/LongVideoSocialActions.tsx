"use client";

import { useCallback, useEffect, useState } from "react";
import { Bookmark, Heart, MessageCircle, Share2, Users } from "lucide-react";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import FollowButton from "@/components/social/FollowButton";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import CommentDrawer from "./CommentDrawer";

type Props = { videoId: string; creatorId: string; initialLikes: number; comments: number };

const countLabel = (value: number) => {
  return new Intl.NumberFormat("en-IN", { notation: value >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(Math.max(0, value));
};

type EngagementState = { followers: number | null; liked: boolean; saved: boolean };

const loadEngagementState = async (videoId: string, creatorId: string): Promise<EngagementState> => {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : "";
  const profileRequest = creatorId ? fetch(`/api/creator/public-profile?videoId=${encodeURIComponent(videoId)}`, { cache: "no-store" }) : Promise.resolve(null);
  const likeRequest = user ? getDoc(doc(db, "watchVideoLikes", `${videoId}_${user.uid}`)) : Promise.resolve(null);
  const saveRequest = user ? fetch(`/api/shorts/video-save?videoId=${encodeURIComponent(videoId)}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }) : Promise.resolve(null);
  const [profileResponse, likeSnap, saveResponse] = await Promise.all([profileRequest, likeRequest, saveRequest]);
  const profilePayload = profileResponse?.ok ? await profileResponse.json() : null;
  const savePayload = saveResponse?.ok ? await saveResponse.json() : null;
  const followerValue = profilePayload?.creator?.followersCount;
  return {
    followers: typeof followerValue === "number" && Number.isFinite(followerValue) ? followerValue : null,
    liked: Boolean(likeSnap?.exists()),
    saved: savePayload?.success === true && savePayload.saved === true,
  };
};

const LongVideoSocialActions = ({ videoId, creatorId, initialLikes, comments }: Props) => {
  const [likes, setLikes] = useState(Math.max(0, initialLikes));
  const [commentCount, setCommentCount] = useState(Math.max(0, comments));
  const { requireAuth } = useRequireAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [followers, setFollowers] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadEngagementState(videoId, creatorId)
      .then((state) => {
        if (cancelled) return;
        setFollowers(state.followers);
        setLiked(state.liked);
        setSaved(state.saved);
      })
      .catch(() => {
        if (!cancelled) setMessage("Engagement status could not be loaded.");
      });
    return () => { cancelled = true; };
  }, [creatorId, videoId]);

  const toggleLike = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) { setMessage("Like karne ke liye pehle login karein."); return; }
    if (busy) return;
    setBusy(true); setMessage("");
    const next = !liked;
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/shorts/video-like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, action: next ? "like" : "unlike", token }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.message || "Like update failed");
      setLiked(next);
      setLikes((value) => Math.max(0, value + (next ? 1 : -1)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Like update failed.");
    } finally { setBusy(false); }
  }, [busy, liked, videoId]);

  const toggleSave = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) { setMessage("Save karne ke liye pehle login karein."); return; }
    if (busy) return;
    setBusy(true); setMessage("");
    const next = !saved;
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/shorts/video-save", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, action: next ? "save" : "unsave" }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.message || "Save update failed");
      setSaved(next);
      setMessage(next ? "Saved to your library." : "Removed from your saved videos.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save update failed.");
    } finally { setBusy(false); }
  }, [busy, saved, videoId]);

  const shareVideo = async () => {
    const url = `${window.location.origin}/videos?v=${encodeURIComponent(videoId)}`;
    try {
      if (navigator.share) await navigator.share({ title: "JEMBEE PLAY", url });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); setMessage("Video link copied."); }
      else setMessage(url);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") setMessage("Unable to share this video.");
    }
  };

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4" aria-label="Video engagement">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => requireAuth(() => toggleLike(), "like", videoId)} disabled={busy} aria-pressed={liked} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${liked ? "bg-rose-500/20 text-rose-300" : "bg-white/10 text-white"} disabled:opacity-50`}>
          <Heart size={17} fill={liked ? "currentColor" : "none"}/> Like <span>{countLabel(likes)}</span>
        </button>
        <button type="button" onClick={() => setCommentsOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold"><MessageCircle size={17}/> Comment <span>{countLabel(commentCount)}</span></button>
        <button type="button" onClick={() => shareVideo()} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold"><Share2 size={17}/> Share</button>
        <button type="button" onClick={() => requireAuth(() => toggleSave(), "save", videoId)} disabled={busy} aria-pressed={saved} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold disabled:opacity-50 ${saved ? "bg-cyan-400/20 text-cyan-200" : "bg-white/10"}`}><Bookmark size={17} fill={saved ? "currentColor" : "none"}/> {saved ? "Saved" : "Save"}</button>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 text-sm text-slate-300"><Users size={18} className="text-cyan-300"/> <strong className="text-white">{followers === null ? "—" : countLabel(followers)}</strong> Followers</div>
        {creatorId ? <FollowButton targetUid={creatorId}/> : <span className="text-xs text-slate-500">Creator profile unavailable</span>}
      </div>
      {message ? <p role="status" className="mt-3 text-xs text-cyan-200">{message}</p> : null}
      <CommentDrawer open={commentsOpen} onClose={() => setCommentsOpen(false)} videoId={videoId} onCommentAdded={() => setCommentCount((value) => value + 1)}/>
    </section>
  );
};

export default LongVideoSocialActions;
