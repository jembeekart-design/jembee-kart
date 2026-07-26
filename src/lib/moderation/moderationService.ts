export const MODERATION_RULES = {
  profanity: ['badword1', 'badword2', 'offensiveword'], // Expanded by admin-settings later
  hateSpeech: ['racistword', 'religiousslur'],
  spam: ['http://', 'https://', 'www.', '.com'],
};

export const ModerationService = {
  isSafe: (text: string): { safe: boolean; reason?: string } => {
    const lowerText = text.toLowerCase();
    
    // Profanity Check
    if (MODERATION_RULES.profanity.some(word => lowerText.includes(word))) {
      return { safe: false, reason: "Your comment violates our Community Guidelines regarding profanity." };
    }

    // Hate Speech Check
    if (MODERATION_RULES.hateSpeech.some(word => lowerText.includes(word))) {
      return { safe: false, reason: "Your comment violates our Community Guidelines regarding hate speech." };
    }

    // Spam Check
    if (MODERATION_RULES.spam.some(word => lowerText.includes(word))) {
      return { safe: false, reason: "Your comment violates our Community Guidelines regarding spam." };
    }

    return { safe: true };
  }
};
