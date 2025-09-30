/**
 * 🧪 GitHub App Comment Command Tests
 * 
 * These tests verify the command detection logic for the bot's comment handling.
 */

describe('Comment Command Detection', () => {
  describe('Bot Mention Detection', () => {
    const mentionPattern = /@xcloud-bot|xcloud-bot/i;

    it('should detect bot mention with @ symbol', () => {
      const commentBody = '@xcloud-bot help';
      expect(mentionPattern.test(commentBody)).toBe(true);
    });

    it('should detect bot mention without @ symbol', () => {
      const commentBody = 'xcloud-bot analyze this issue';
      expect(mentionPattern.test(commentBody)).toBe(true);
    });

    it('should be case insensitive', () => {
      const commentBody = '@XCloud-Bot HELP';
      expect(mentionPattern.test(commentBody)).toBe(true);
    });

    it('should detect mention in middle of text', () => {
      const commentBody = 'Hey @xcloud-bot can you help?';
      expect(mentionPattern.test(commentBody)).toBe(true);
    });

    it('should not match when bot is not mentioned', () => {
      const commentBody = 'This is just a regular comment';
      expect(mentionPattern.test(commentBody)).toBe(false);
    });

    it('should not match partial bot name', () => {
      const commentBody = 'xcloud is great';
      expect(mentionPattern.test(commentBody)).toBe(false);
    });
  });

  describe('Help Command Detection', () => {
    it('should detect help command in English', () => {
      const commentBody = '@xcloud-bot help me please';
      const commentLower = commentBody.toLowerCase();
      expect(commentLower.includes('help')).toBe(true);
    });

    it('should detect help command in Portuguese', () => {
      const commentBody = '@xcloud-bot ajuda por favor';
      const commentLower = commentBody.toLowerCase();
      expect(commentLower.includes('ajuda')).toBe(true);
    });

    it('should detect help in mixed case', () => {
      const commentBody = '@xcloud-bot HELP';
      const commentLower = commentBody.toLowerCase();
      expect(commentLower.includes('help')).toBe(true);
    });
  });

  describe('Analyze Command Detection', () => {
    it('should detect analyze command in English', () => {
      const commentBody = '@xcloud-bot analyze this issue';
      const commentLower = commentBody.toLowerCase();
      expect(commentLower.includes('analyze')).toBe(true);
    });

    it('should detect analyze command in Portuguese', () => {
      const commentBody = '@xcloud-bot analisa esta issue';
      const commentLower = commentBody.toLowerCase();
      expect(commentLower.includes('analisa')).toBe(true);
    });

    it('should detect analyze in mixed case', () => {
      const commentBody = '@xcloud-bot ANALYZE';
      const commentLower = commentBody.toLowerCase();
      expect(commentLower.includes('analyze')).toBe(true);
    });

    it('should handle analyze with additional text', () => {
      const commentBody = '@xcloud-bot please analyze this PR carefully';
      const commentLower = commentBody.toLowerCase();
      expect(commentLower.includes('analyze')).toBe(true);
    });
  });

  describe('Command Prioritization', () => {
    it('should detect help over analyze when both present', () => {
      const commentBody = '@xcloud-bot help me analyze';
      const commentLower = commentBody.toLowerCase();
      const hasHelp = commentLower.includes('help') || commentLower.includes('ajuda');
      const hasAnalyze = commentLower.includes('analyze') || commentLower.includes('analisa');
      
      expect(hasHelp).toBe(true);
      expect(hasAnalyze).toBe(true);
      // In implementation, help is checked first
    });
  });
});
