/**
 * Plain-Language Rule Parser for VoiceLeash
 * Parses spoken or written natural language policy instructions into structured NEAR policy rules.
 */

export function parseNaturalLanguageRules(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const text = input.toLowerCase();

  // Defaults
  let dailyLimit = null;
  let requireApprovalAbove = null;
  let allowedCategories = ['ALL'];

  // Pattern 1: Daily limit (e.g. "spend up to 2 near a day", "2 near daily", "daily budget 2 near", "max 3 near/day")
  const dailyMatches = [
    /(?:spend up to|limit of|max of|maximum of|budget of|daily limit(?: is)?)\s*([0-9.]+)\s*(?:near)?(?:\s*(?:a day|per day|daily))?/i,
    /([0-9.]+)\s*(?:near)?\s*(?:a day|per day|daily\s*limit|daily)/i,
    /(?:daily limit:?\s*)([0-9.]+)/i
  ];

  for (const regex of dailyMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (!isNaN(val)) {
        dailyLimit = val;
        break;
      }
    }
  }

  // Pattern 2: Approval threshold (e.g. "ask me for anything over 0.4", "confirm anything above 0.5 near", "require approval over 0.3")
  const approvalMatches = [
    /(?:ask(?: me)?(?: for)?(?: anything)?|confirm|require approval|approve)\s*(?:over|above|greater than|exceeding)?\s*([0-9.]+)\s*(?:near)?/i,
    /(?:over|above|greater than)\s*([0-9.]+)\s*(?:near)?\s*(?:require approval|ask me|confirm)/i,
    /(?:ask me above:?\s*)([0-9.]+)/i
  ];

  for (const regex of approvalMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (!isNaN(val)) {
        requireApprovalAbove = val;
        break;
      }
    }
  }

  // Detect category filters if mentioned
  const cats = [];
  if (text.includes('data') || text.includes('dataset')) cats.push('DATA');
  if (text.includes('api')) cats.push('API');
  if (text.includes('research') || text.includes('brief')) cats.push('RESEARCH');
  if (text.includes('news')) cats.push('NEWS');
  if (cats.length > 0) {
    allowedCategories = cats;
  }

  return {
    rawInput: input,
    dailyLimit: dailyLimit !== null ? dailyLimit : 1.0,
    requireApprovalAbove: requireApprovalAbove !== null ? requireApprovalAbove : 0.25,
    allowedCategories,
    timestamp: new Date().toISOString()
  };
}
