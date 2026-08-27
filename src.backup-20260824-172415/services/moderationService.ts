import { 
  doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, 
  onSnapshot, serverTimestamp, query, where, Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
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
  allowedDomains: ['youtube.com', 'github.com', 'jembeekart.com'],
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
  customMessage: "Your comment contains restricted content or violates community guidelines."
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
  adminId: string, 
  reason: string
): Promise<void> => {
  const docRef = doc(db, 'commentModeration', 'settings');
  const currentSnap = await getDoc(docRef);
  const oldValue = currentSnap.exists() ? currentSnap.data() : {};

  await setDoc(docRef, newSettings, { merge: true });
  settingsCache = null; // Invalidate cache

  // Write audit log
  const changedFields = Object.keys(newSettings).filter(
    key => JSON.stringify((oldValue as Record<string, any>)[key]) !== JSON.stringify((newSettings as Record<string, any>)[key])
  );

  const auditLog: CommentAuditLog = {
    timestamp: serverTimestamp(),
    adminId,
    oldValue,
    newValue: newSettings,
    changedFields,
    reason,
  };

  await addDoc(collection(db, 'commentAuditLogs'), auditLog);
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
