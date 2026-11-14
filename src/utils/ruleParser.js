/**
 * Plain-Language Rule Parser for VoiceLeash
 * Parses spoken or written natural language policy instructions into structured NEAR policy rules.
 * Handles spoken number words (e.g. "two" -> 2, "zero point two five" -> 0.25) and enforces
 * that both daily spend budget and confirmation threshold are provided.
 */

export function normalizeSpokenWords(str) {
  if (!str || typeof str !== 'string') return '';
  let text = str.toLowerCase();

  const digitWords = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
  };

  // 1. Spoken compound decimals: 'zero point two five', 'point two five', 'zero point five'
  text = text.replace(/(?:zero\s+)?point\s+([a-z]+)(?:\s+([a-z]+))?/gi, (match, d1, d2) => {
    if (d1 === 'twenty' && (d2 === 'five' || !d2)) return '0.25';
    if (d1 === 'seventy' && (d2 === 'five' || !d2)) return '0.75';
    if (d1 === 'fifteen') return '0.15';
    if (d1 === 'fifty') return '0.5';
    const v1 = digitWords[d1];
    if (v1 !== undefined) {
      const v2 = d2 ? digitWords[d2] : '';
      return '0.' + v1 + (v2 || '');
    }
    return match;
  });

  // 2. Fractions and informal quantities
  text = text.replace(/\bhalf(?:\s+a)?\s+near\b/gi, '0.5 near');
  text = text.replace(/\ba\s+quarter\s+near\b/gi, '0.25 near');
  text = text.replace(/\bhalf\b/gi, '0.5');
  text = text.replace(/\ba\s+quarter\b/gi, '0.25');

  // 3. Whole number + decimal word: 'two point five' -> 2.5
  text = text.replace(/\b([a-z]+)\s+point\s+([a-z]+)\b/gi, (match, w1, w2) => {
    if (digitWords[w1] !== undefined && digitWords[w2] !== undefined) {
      return digitWords[w1] + '.' + digitWords[w2];
    }
    return match;
  });

  // 4. Standalone number words
  const standaloneWords = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
    'ten': '10', 'twenty': '20', 'fifty': '50', 'hundred': '100'
  };

  for (const [w, n] of Object.entries(standaloneWords)) {
    const rx = new RegExp('\\b' + w + '\\b', 'gi');
    text = text.replace(rx, n);
  }

  return text;
}

export function parseNaturalLanguageRules(input) {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      error: 'Please enter or speak a spending rule.',
      rawInput: '',
      normalizedText: ''
    };
  }

  // Normalize spoken numbers ("two" -> "2", "point two five" -> "0.25")
  const normalized = normalizeSpokenWords(input);
  const text = normalized.toLowerCase();

  let dailyLimit = null;
  let requireApprovalAbove = null;
  let allowedCategories = ['ALL'];

  // Pattern 1: Daily limit
  // e.g. "spend up to 2 near daily", "2 near daily", "daily budget of 2 near", "max 3 near a day"
  const dailyMatches = [
    /(?:spend up to|limit of|max of|maximum of|budget of|daily limit(?: is)?)\s*([0-9.]+)\s*(?:near)?(?:\s*(?:a day|per day|daily))?/i,
    /([0-9.]+)\s*(?:near)?\s*(?:a day|per day|daily\s*limit|daily)/i,
    /(?:daily limit:?\s*)([0-9.]+)/i
  ];

  for (const regex of dailyMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val > 0) {
        dailyLimit = val;
        break;
      }
    }
  }

  // Pattern 2: Approval threshold
  // e.g. "ask for confirmation before buying anything over 0.25 near", "confirm over 0.4 near", "require approval above 0.5"
  const approvalMatches = [
    /(?:ask|confirm|approval|confirmation).*?(?:over|above|greater than|exceeding|more than)\s*([0-9.]+)\s*(?:near)?/i,
    /(?:over|above|greater than|exceeding|more than)\s*([0-9.]+)\s*(?:near)?.*?(?:ask|confirm|approval|confirmation)/i,
    /(?:ask(?: me)?(?: for)?(?: anything)?|confirm|require approval|approve)\s*(?:over|above|greater than|exceeding)?\s*([0-9.]+)\s*(?:near)?/i,
    /(?:ask me above:?\s*)([0-9.]+)/i
  ];

  for (const regex of approvalMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val >= 0) {
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

  // Enforce validation: both parameters must be detected!
  const missing = [];
  if (dailyLimit === null) missing.push('Daily Budget (e.g. "spend up to 2 NEAR daily")');
  if (requireApprovalAbove === null) missing.push('Confirmation Threshold (e.g. "ask before buying anything over 0.25 NEAR")');

  if (missing.length > 0) {
    return {
      isValid: false,
      error: `Missing parameter: ${missing.join(' and ')}. Please provide both numbers in your instruction.`,
      missingParams: missing,
      dailyLimit,
      requireApprovalAbove,
      rawInput: input,
      normalizedText: normalized
    };
  }

  return {
    isValid: true,
    rawInput: input,
    normalizedText: normalized,
    dailyLimit,
    requireApprovalAbove,
    allowedCategories,
    timestamp: new Date().toISOString()
  };
}
