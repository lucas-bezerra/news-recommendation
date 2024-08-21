const natural = require('natural');
const sanitizeHtml = require('sanitize-html');
const { removeStopwords, porBr } = require('stopword');

function clearText (text: string) {
  text = sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {}
  })

  return text.toLowerCase();
}

function stopwords (text: string) {
  const tokenizer = new natural.AggressiveTokenizerPt();
  const tokens = tokenizer.tokenize(text);
  return removeStopwords(tokens, porBr);
}

function generateNgrams (tokens: string[], n = 2) {
  return natural.NGrams.ngrams(tokens, n).map((gram: string[]) => gram.join(' '));
}

async function preprocessText (text: string, ngramSize = 2) {
  text = clearText(text);
  let tokens = stopwords(text);
  const ngrams = generateNgrams(tokens, ngramSize);
  return tokens.concat(ngrams);
}

module.exports = {
  preprocessText
};
