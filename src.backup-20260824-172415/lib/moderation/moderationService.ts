export const MODERATION_RULES = {
  // Add a comprehensive list of abusive words
  prohibitedWords: [
    'fuck', 'shit', 'bitch', 'asshole', 'pussy', 'dick', 'cock', 'cunt', // English
    'madarchod', 'bhenchod', 'chutiya', 'randi', 'gandu', 'bsdk', 'chod' // Hindi
  ],
  hateSpeech: ['racist', 'kill', 'hate', 'inferior'],
};

export const ModerationService = {
  isSafe: (text: string): { safe: boolean; reason?: string } => {
    // Normalize: remove symbols, spaces, and convert to lowercase
    const normalized = text.toLowerCase().replace(/[^a-z]/g, '');

    // Check against prohibited words
    for (const word of MODERATION_RULES.prohibitedWords) {
      // Check if word or variation (with symbols removed) exists
      if (normalized.includes(word.replace(/[^a-z]/g, ''))) {
        return { safe: false, reason: "Your comment violates our Community Guidelines." };
      }
    }

    // Additional checks (hate speech, etc.)
    if (MODERATION_RULES.hateSpeech.some(word => normalized.includes(word))) {
      return { safe: false, reason: "Your comment violates our Community Guidelines." };
    }

    return { safe: true };
  }
};
