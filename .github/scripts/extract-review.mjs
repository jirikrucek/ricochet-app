// Turns the events of `opencode run --format json` into the review object
// post-review.sh expects: {"summary": "...", "comments": [...]}. Runs in the
// read-only review job.
//
// The model is asked for one JSON object and nothing else, but replies drift:
// a code fence around it, a sentence before it, or a raw line break inside a
// string (common when a comment quotes code). This takes the text from the
// first { to the last }, and escapes raw control characters inside strings
// when the text doesn't parse as it is.
//
// Usage: node extract-review.mjs <events.jsonl> <review.json>

import { readFileSync, writeFileSync } from 'node:fs';

const [eventsPath, outputPath] = process.argv.slice(2);

const fail = (message, reply = '') => {
  console.log(`::error::${message}`);
  if (reply) console.log(reply);
  process.exit(1);
};

// The reply is the text of the last message that has any.
const texts = readFileSync(eventsPath, 'utf8')
  .split('\n')
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line))
  .filter((event) => event.type === 'text');
const lastMessage = texts.at(-1)?.part.messageID;
const reply = texts
  .filter((event) => event.part.messageID === lastMessage)
  .map((event) => event.part.text)
  .join('');
if (reply.trim() === '') fail('OpenCode returned no reply');

const start = reply.indexOf('{');
const end = reply.lastIndexOf('}');
if (start === -1 || end < start) fail('The reply holds no JSON object', reply);
const candidate = reply.slice(start, end + 1);

function escapeControlCharactersInStrings(text) {
  const escapes = { '\n': '\\n', '\r': '\\r', '\t': '\\t' };
  let inString = false;
  let escaped = false;
  let result = '';
  for (const char of text) {
    if (inString && !escaped && char < ' ') {
      result +=
        escapes[char] ??
        `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
      continue;
    }
    if (inString && !escaped && char === '\\') escaped = true;
    else {
      if (char === '"' && !escaped) inString = !inString;
      escaped = false;
    }
    result += char;
  }
  return result;
}

let review;
try {
  review = JSON.parse(candidate);
} catch {
  try {
    review = JSON.parse(escapeControlCharactersInStrings(candidate));
  } catch (error) {
    fail(`The reply is not valid JSON: ${error.message}`, reply);
  }
}

if (typeof review?.summary !== 'string' || !Array.isArray(review.comments)) {
  fail('The reply is not a review: it needs a summary and comments', reply);
}

writeFileSync(outputPath, JSON.stringify(review));
console.log(reply);
