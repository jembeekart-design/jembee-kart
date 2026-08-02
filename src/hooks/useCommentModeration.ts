import { useState, useEffect, useCallback } from 'react';
import { ModerationSettings, RegexRule, CommentViolation } from '@/types/moderation';
import { getModerationSettings, subscribeToModerationSettings, getRegexRules, getUserViolation } from '@/services/moderationService';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  action?: 'reject' | 'hide' | 'pendingReview';
  toxicScore?: number;
}

export function useCommentModeration() {
  const [settings, setSettings] = useState<ModerationSettings | null>(null);
  const [regexRules, setRegexRules] = useState<RegexRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModerationSettings().then(s => {
      setSettings(s);
      setLoading(false);
    });

    getRegexRules().then(rules => setRegexRules(rules));

    const unsubscribe = subscribeToModerationSettings((updated) => {
      setSettings(updated);
    });

    return () => unsubscribe();
  }, []);

  const validateCommentLocally = useCallback(async (
    text: string, 
    userId: string, 
    userHistoryCountToday = 0
  ): Promise<ValidationResult> => {
    if (!settings) return { isValid: true };

    // 1. Global & Auth Checks
    if (!settings.commentsEnabled) {
      return { isValid: false, message: "Comments are currently disabled by administrators." };
    }
    if (settings.requireLoginToComment && !userId) {
      return { isValid: false, message: "You must be logged in to post a comment." };
    }

    // 2. User Ban Status Check
    const violation: CommentViolation | null = await getUserViolation(userId);
    if (violation && violation.banUntil) {
      if (violation.isPermanent || Date.now() < violation.banUntil) {
        return { 
          isValid: false, 
          message: `Your account is restricted from commenting. Reason: ${violation.banReason || 'Policy violation'}` 
        };
      }
    }

    // 3. Length Constraints
    if (text.length < settings.minCommentLength) {
      return { isValid: false, message: `Comment is too short (Minimum ${settings.minCommentLength} characters).` };
    }
    if (text.length > settings.maxCommentLength) {
      return { isValid: false, message: `Comment exceeds maximum length of ${settings.maxCommentLength} characters.` };
    }

    const workingText = settings.caseInsensitive ? text.toLowerCase() : text;

    // 4. Whitelist Precedence (Whitelisted words override blocked words & filters)
    const whitelistedWords = settings.allowedWords || [];
    let cleanTextForWordCheck = workingText;
    whitelistedWords.forEach(w => {
      const targetWord = settings.caseInsensitive ? w.toLowerCase() : w;
      cleanTextForWordCheck = cleanTextForWordCheck.split(targetWord).join('WHILELISTED_MATCH');
    });

    // 5. Blocked Words Check
    if (settings.enabled && settings.blockedWords && settings.blockedWords.length > 0) {
      for (const word of settings.blockedWords) {
        const bWord = settings.caseInsensitive ? word.toLowerCase() : word;
        const isMatched = settings.blockPartialMatch 
          ? cleanTextForWordCheck.includes(bWord) 
          : cleanTextForWordCheck.split(/\s+/).includes(bWord);

        if (isMatched) {
          return { 
            isValid: false, 
            message: settings.customMessage, 
            action: settings.moderationAction 
          };
        }
      }
    }

    // 6. Regex Custom Rules Check
    for (const rule of regexRules) {
      if (rule.enabled) {
        try {
          const regex = new RegExp(rule.pattern, settings.caseInsensitive ? 'i' : '');
          if (regex.test(text)) {
            return { isValid: false, message: rule.message || settings.customMessage, action: settings.moderationAction };
          }
        } catch (e) {
          console.error(`Invalid regex rule: ${rule.pattern}`, e);
        }
      }
    }

    // 7. Link / URL & Domain Filtering
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasUrls = urlRegex.test(text);
    if (hasUrls) {
      if (!settings.allowLinks) {
        return { isValid: false, message: "Links are not allowed in comments.", action: settings.moderationAction };
      }
      // Domain Whitelist / Blacklist Check
      const matches = text.match(urlRegex) || [];
      for (const urlStr of matches) {
        try {
          const domain = new URL(urlStr).hostname.replace('www.', '');
          if (settings.blockedDomains && settings.blockedDomains.includes(domain)) {
            return { isValid: false, message: `Domain '${domain}' is blocked.`, action: settings.moderationAction };
          }
          if (settings.allowedDomains && settings.allowedDomains.length > 0) {
            const isAllowedDomain = settings.allowedDomains.some(d => domain.endsWith(d));
            if (!isAllowedDomain) {
              return { isValid: false, message: `Domain '${domain}' is not on the allowed domains list.`, action: settings.moderationAction };
            }
          }
        } catch (e) {
          // Invalid URL format caught by pattern
        }
      }
    }

    // 8. Phone Numbers & Emails
    const phoneRegex = /\b\d{10}\b|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
    if (!settings.allowPhoneNumbers && phoneRegex.test(text)) {
      return { isValid: false, message: "Phone numbers are not allowed.", action: settings.moderationAction };
    }

    const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
    if (!settings.allowEmailAddresses && emailRegex.test(text)) {
      return { isValid: false, message: "Email addresses are not allowed.", action: settings.moderationAction };
    }

    // 9. Emojis and Categories
    const emojiRegex = /[\p{Extended_Pictographic}/u]/gu;
    const emojis = text.match(emojiRegex) || [];
    if (!settings.allowEmojis && emojis.length > 0) {
      return { isValid: false, message: "Emojis are not permitted.", action: settings.moderationAction };
    }
    if (settings.maxEmojis && emojis.length > settings.maxEmojis) {
      return { isValid: false, message: `Too many emojis. Maximum allowed is ${settings.maxEmojis}.`, action: settings.moderationAction };
    }

    // 10. Spam Detection & Toxic Scoring simulation
    if (settings.enableSpamDetection) {
      // Check repeated character spam e.g. aaaaaaa
      const repeatCharRegex = /(.)\1{5,}/;
      if (repeatCharRegex.test(text)) {
        return { isValid: false, message: "Spam detected: excessive repeated characters.", action: settings.moderationAction };
      }
    }

    return { 
      isValid: true, 
      action: settings.autoApproveComments ? 'pendingReview' : 'pendingReview' 
    };
  }, [settings, regexRules]);

  return { settings, regexRules, loading, validateCommentLocally };
}
