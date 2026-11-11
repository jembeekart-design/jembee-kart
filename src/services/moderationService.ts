import { 
  doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, 
  onSnapshot, serverTimestamp, query, where, Timestamp 
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { ModerationSettings, RegexRule, CommentViolation, CommentAuditLog } from '@/types/moderation';

let settingsCache: ModerationSettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 Minute local cache

export const DEFAULT_SETTINGS: ModerationSettings = {
  enabled: true,
  commentsEnabled: true,
  requireLoginToComment: true,
  blockedWords: [],
  allowedWords: [],
  caseInsensitive: true,
  blockPartialMatch: true,
  enableProfanityFilter: true,
  minCommentLength: 1,
  maxCommentLength: 500,
  allowLinks: false,
  allowPhoneNumbers: false,
  allowEmailAddresses: false,
  allowEmojis: true,
  allowedDomains: ['youtube.com', 'github.com'],
  blockedDomains: [],
  allowMentions: true,
  mentionRule: 'all',
  allowHashtags: true,
  maxHashtags: 5,
  blockedHashtags: [],
  maxEmojis: 10,
  allowedEmojiCategories: [],
  blockedEmojiCategories: [],
  maxCommentsPerMinute: 5,
  maxCommentsPerHour: 30,
  maxCommentsPerDay: 100,
  duplicateCommentWindowSeconds: 60,
  enableSpamDetection: true,
  enableToxicScoring: true,
  toxicThresholdReview: 20,
  toxicThresholdHide: 40,
  toxicThresholdReject: 60,
  allowedLanguages: ['en', 'hi'],
  blockedLanguages: [],
  autoApproveComments: true,
  approvalMode: 'instant',
  moderationAction: 'reject',
  customMessage: "Your comment contains restricted content or violates community guidelines.",
  enableVideoModeration: true,
  videoToxicThreshold: 50
};

export const getModerationSettings = async (forceRefresh = false): Promise<ModerationSettings> => {
  const now = Date.now();
  if (!forceRefresh && settingsCache && (now - cacheTimestamp < CACHE_TTL)) {
    return settingsCache;
  }

  try {
    const docRef = doc(db, 'commentModeration', 'settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      settingsCache = { ...DEFAULT_SETTINGS, ...(snap.data() as ModerationSettings) };
      cacheTimestamp = now;
      return settingsCache;
    } else {
      await setDoc(docRef, DEFAULT_SETTINGS);
      settingsCache = DEFAULT_SETTINGS;
      return DEFAULT_SETTINGS;
    }
  } catch (err) {
    console.error("Error fetching moderation settings, falling back to cache/default", err);
    return settingsCache || DEFAULT_SETTINGS;
  }
};

export const subscribeToModerationSettings = (callback: (settings: ModerationSettings) => void) => {
  const docRef = doc(db, 'commentModeration', 'settings');
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const newSettings = { ...DEFAULT_SETTINGS, ...(snap.data() as ModerationSettings) };
      settingsCache = newSettings;
      cacheTimestamp = Date.now();
      callback(newSettings);
    }
  });
};

export const updateModerationSettings = async (
  newSettings: Partial<ModerationSettings>,
  _adminId: string,
  reason: string
): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Please sign in again.");
  const token = await currentUser.getIdToken();
  const response = await fetch("/api/admin/comment-moderation-settings", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ settings: newSettings, reason }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success !== true) throw new Error(typeof result.message === "string" ? result.message : "Moderation settings could not be saved.");
  settingsCache = null;
};

export const getRegexRules = async (): Promise<RegexRule[]> => {
  const snapshot = await getDocs(collection(db, 'commentRegexRules'));
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as RegexRule));
};

export const getUserViolation = async (userId: string): Promise<CommentViolation | null> => {
  const docRef = doc(db, 'commentViolations', userId);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as CommentViolation) : null;
};
