function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value) {
  const t = normalizeText(value);
  if (!t) return [];
  return t.split(" ").filter(Boolean).slice(0, 12);
}

function scoreRoughMatch({ lost, found }) {
  let score = 0;

  if (normalizeText(lost.category) && normalizeText(lost.category) === normalizeText(found.category)) {
    score += 40;
  }

  const lostName = tokens(lost.itemName);
  const foundName = tokens(found.itemName);
  const overlap = lostName.filter((x) => foundName.includes(x)).length;
  score += Math.min(30, overlap * 10);

  const lostLoc = tokens(lost.lastSeenLocation);
  const foundLoc = tokens(found.foundLocation);
  const locOverlap = lostLoc.filter((x) => foundLoc.includes(x)).length;
  score += Math.min(30, locOverlap * 6);

  return score;
}

module.exports = { scoreRoughMatch, normalizeText, tokens };

