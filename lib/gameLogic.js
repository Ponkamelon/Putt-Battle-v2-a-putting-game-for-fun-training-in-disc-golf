// Ren spellogik, flyttad nästan oförändrad från putt-battle-prototype.jsx.
// Samma regler som i den befintliga prototypen: poängbrackets, avstånds-
// steg (bakåt vid träff, framåt vid miss), och svårighetsgrader.

export const DIFFICULTIES = {
  beginner: { start: 3, hands: ["backhand"], kneeAvailable: false, weakHandAvailable: false },
  amateur: { start: 4, hands: ["forehand", "backhand"], kneeAvailable: true, weakHandAvailable: false },
  pro: { start: 5, hands: ["forehand", "backhand"], kneeAvailable: true, weakHandAvailable: true },
};

export const MIN_DISTANCE = 3;

export function scoreFor(distance) {
  if (distance <= 10) return { points: 1, kind: "putt", throws: 1 };
  if (distance <= 15) return { points: 2, kind: "putt", throws: 1 };
  if (distance <= 20) return { points: 2, kind: "approach", throws: 2 };
  return { points: 3, kind: "approach", throws: 2 };
}

export function depthStepSize(distance) {
  return distance <= 10 ? 1 : 2 + Math.floor(Math.random() * 2);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function buildTurn(distance, diff) {
  const s = scoreFor(distance);
  const hand = diff.hands.length > 1 ? pick(diff.hands) : diff.hands[0];
  const knee = diff.kneeAvailable && Math.random() < 0.3;
  const weakHand = diff.weakHandAvailable && Math.random() < 0.15;
  return {
    distance,
    kind: s.kind,
    points: s.points,
    throwsNeeded: s.throws,
    throwsDone: 0,
    throwHits: 0,
    hand,
    knee,
    weakHand,
  };
}
