"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, X, Check, ChevronRight, RotateCcw, Trophy, Target, Sparkles, Shield } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

import { LOGO_DATA_URI, T, DISPLAY_FONT, BODY_FONT, MONO_FONT, LANGUAGES, LANG_LABEL, PRIVACY_FILES, detectLanguage, STRINGS, t } from "../../lib/shared";

function getPerks(lang) {
  const s = STRINGS[lang];
  return [
    { id: "double", label: s.perkDoubleLabel, desc: s.perkDoubleDesc, negative: false },
    { id: "forceForehand", label: s.perkForceForehandLabel, desc: s.perkForceForehandDesc, negative: true },
    { id: "forceBackhand", label: s.perkForceBackhandLabel, desc: s.perkForceBackhandDesc, negative: true },
    { id: "forceKnee", label: s.perkForceKneeLabel, desc: s.perkForceKneeDesc, negative: true },
    { id: "pushSteps", label: s.perkPushStepsLabel, desc: s.perkPushStepsDesc, negative: true },
    { id: "immune", label: s.perkImmuneLabel, desc: s.perkImmuneDesc, negative: false },
    { id: "steal", label: s.perkStealLabel, desc: s.perkStealDesc, negative: true, golden: true },
    { id: "approach", label: s.perkApproachLabel, desc: s.perkApproachDesc, negative: true },
    { id: "sabotage", label: s.perkSabotageLabel, desc: s.perkSabotageDesc, negative: true },
  ];
}

function getPressTypes(lang) {
  const s = STRINGS[lang];
  return [
    { id: "mulligan", label: s.pressMulliganLabel, desc: s.pressMulliganDesc },
    { id: "byt", label: s.pressBytLabel, desc: s.pressBytDesc },
    { id: "kaos", label: s.pressKaosLabel, desc: s.pressKaosDesc },
    { id: "approach", label: s.pressApproachLabel, desc: s.pressApproachDesc },
  ];
}

const DIFFICULTIES = {
  beginner: { key: "difficultyBeginner", start: 3, hands: ["backhand"], kneeAvailable: false, weakHandAvailable: false },
  amateur: { key: "difficultyAmateur", start: 4, hands: ["backhand", "forehand"], kneeAvailable: true, weakHandAvailable: false },
  pro: { key: "difficultyPro", start: 5, hands: ["backhand", "forehand"], kneeAvailable: true, weakHandAvailable: true },
};

const PLAYER_COLORS = [
  "#FFC845", "#5BC8FF", "#FF6FA8", "#B98CFF", "#7CE38B",
  "#FF9F5A", "#66E0D0", "#C5E86C", "#9AA5FF", "#FF8F8F",
];

function scoreFor(distance) {
  if (distance <= 10) return { points: 1, kind: "putt", throws: 1 };
  if (distance <= 15) return { points: 2, kind: "putt", throws: 1 };
  if (distance <= 20) return { points: 2, kind: "approach", throws: 2 };
  return { points: 3, kind: "approach", throws: 2 };
}

function rand(n) { return Math.floor(Math.random() * (n + 1)); }
function pick(arr) { return arr[rand(arr.length - 1)]; }

// Step magnitude 1-3, weighted so 1 is most common and 3 is rarest (weights 3:2:1).
function weightedMagnitude() {
  const r = Math.random();
  if (r < 0.5) return 1;
  if (r < 0.8333) return 2;
  return 3;
}

function emptyStats() {
  return {
    puttAttempts: 0, puttMakes: 0,
    approachAttempts: 0, approachMakes: 0,
    forehand: 0, forehandMakes: 0,
    backhand: 0, backhandMakes: 0,
    longestPutt: 0, longestApproach: 0,
    perksCount: 0,
  };
}

function emptyEffects() {
  return { forceHand: null, forceKnee: false, doublePoints: false, pushSteps: 0, immune: false, forceApproach: false, sabotageBy: null };
}

// Distance never moves randomly anymore — it moves deterministically based on the outcome
// of each throw: a hit pushes the player back (harder), a miss pulls them forward (easier).
// Step size depends on how far out they currently are.
const MIN_DISTANCE = 3;
function depthStepSize(distance) {
  return distance <= 10 ? 1 : 2 + rand(1); // 1 step at 4-10m, 2-3 steps beyond that
}

// Lateral (sideways) step: always 1-3, weighted toward 1, simulating real obstacles like trees.
function rollLateralStep(extra = 0) {
  const magnitude = weightedMagnitude() + extra;
  const sign = Math.random() < 0.5 ? -1 : 1;
  return magnitude * sign;
}

function StepMap() { return null; } // legacy placeholder, unused

// Solo Mode session history, kept in memory for this browser tab only (no persistent
// storage is used in artifacts). Resets on reload; full cross-visit history is a v2.0
// feature that requires an account.
let soloHistory = [];

// Explicit, spoken instruction for the physical steps to take before this throw.
function stepInstruction(lang, turn) {
  if (turn.dx === 0 && turn.dy === 0) return t(lang, "noStep");
  const s = STRINGS[lang];
  const parts = [];
  if (turn.dy !== 0) parts.push(`${Math.abs(turn.dy)} ${s.stepsWord} ${turn.dy > 0 ? s.back : s.forward}`);
  if (turn.dx !== 0) parts.push(`${Math.abs(turn.dx)} ${s.stepsWord} ${turn.dx > 0 ? s.right : s.left}`);
  return `${s.take} ` + parts.join(` ${s.andWord} `);
}

// Field map: basket fixed at the top ("norr"), players stand south (below) at a distance
// proportional to how far from the basket they are. All players are always visible in their
// own color; the active player is drawn sharp and large, others are dimmed but still legible.
function FieldMap({ players, turnIdx, maxDistance, lang, width = 260, height = 210 }) {
  const topPad = 26, bottomPad = 14, sidePad = 24;
  const usableH = height - topPad - bottomPad;
  const usableW = width - sidePad * 2;
  const lateralRange = 7;

  const toXY = (dx, dist) => {
    const x = width / 2 + (dx / lateralRange) * (usableW / 2);
    const y = topPad + (Math.min(dist, maxDistance) / maxDistance) * usableH;
    return [x, y];
  };

  const activeTrail = players[turnIdx]?.trail || [];
  const showLine = activeTrail.length >= 2;
  const linePath = activeTrail.map((p, i) => {
    const [x, y] = toXY(p.dx, p.distance);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect x={sidePad} y={topPad} width={usableW} height={usableH} fill="none" stroke={T.surfaceLine} strokeWidth="1" rx="8" />
      <line x1={width / 2} y1={topPad} x2={width / 2} y2={topPad + usableH} stroke={T.surfaceLine} strokeWidth="1" strokeDasharray="2 5" />

      <g transform={`translate(${width / 2},${topPad})`}>
        <ellipse cx="0" cy="-9" rx="8" ry="2.5" fill="none" stroke={T.chain} strokeWidth="1.3" />
        <line x1="-6" y1="-9" x2="-2" y2="1" stroke={T.chain} strokeWidth="1" />
        <line x1="-3" y1="-9" x2="-1" y2="1" stroke={T.chain} strokeWidth="1" />
        <line x1="0" y1="-9" x2="0" y2="1" stroke={T.chain} strokeWidth="1" />
        <line x1="3" y1="-9" x2="1" y2="1" stroke={T.chain} strokeWidth="1" />
        <line x1="6" y1="-9" x2="2" y2="1" stroke={T.chain} strokeWidth="1" />
        <path d="M-7,1 L7,1 L5,7 L-5,7 Z" fill="none" stroke={T.chain} strokeWidth="1.3" />
        <line x1="0" y1="7" x2="0" y2="13" stroke={T.surfaceLine} strokeWidth="2" />
      </g>

      {showLine && <path d={linePath} fill="none" stroke={T.accent} strokeWidth="1.2" opacity="0.5" />}

      {players.map((p, i) => {
        const last = p.trail && p.trail.length ? p.trail[p.trail.length - 1] : { dx: 0, distance: p.distance };
        const [x, y] = toXY(last.dx, last.distance);
        const isActive = i === turnIdx;
        return (
          <g key={i} opacity={isActive ? 1 : 0.55}>
            <circle cx={x} cy={y} r={isActive ? 8 : 5} fill={p.color} stroke={isActive ? T.ink : "none"} strokeWidth={isActive ? 1.5 : 0} />
            <text
              x={x} y={y - (isActive ? 13 : 9)} textAnchor="middle"
              fontFamily={MONO_FONT} fontSize={isActive ? 10 : 8} fontWeight={isActive ? 700 : 400}
              fill={isActive ? p.color : T.inkDim}
            >
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "12px 14px", borderRadius: 10,
        background: T.surface, border: `1px solid ${T.surfaceLine}`,
        color: T.ink, fontFamily: BODY_FONT, fontSize: 14, cursor: "pointer",
      }}
    >
      <span>{label}</span>
      <span style={{
        width: 40, height: 22, borderRadius: 11, background: value ? T.accent : T.surfaceLine,
        position: "relative", transition: "background .15s",
      }}>
        <span style={{
          position: "absolute", top: 2, left: value ? 20 : 2, width: 18, height: 18,
          borderRadius: "50%", background: value ? T.accentInk : T.inkDim, transition: "left .15s",
        }} />
      </span>
    </button>
  );
}

function Pill({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px", borderRadius: 999, cursor: "pointer",
        fontFamily: BODY_FONT, fontWeight: 600, fontSize: 14,
        background: active ? T.accent : "transparent",
        color: active ? T.accentInk : T.ink,
        border: `1.5px solid ${active ? T.accent : T.surfaceLine}`,
      }}
    >
      {children}
    </button>
  );
}

function GreenPill({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: "10px 8px", borderRadius: 999, cursor: "pointer",
        fontFamily: BODY_FONT, fontWeight: 600, fontSize: 13, textAlign: "center",
        background: active ? T.good : "transparent",
        color: active ? T.accentInk : T.ink,
        border: `1.5px solid ${active ? T.good : T.surfaceLine}`,
      }}
    >
      {children}
    </button>
  );
}

export default function FriendsPage() {
  const router = useRouter();
  const [screen, setScreen] = useState("setup");
  const [accountUser, setAccountUser] = useState(undefined);
  const [language, setLanguage] = useState(detectLanguage);
  const [soloMode, setSoloMode] = useState(false);
  const [numPlayers, setNumPlayers] = useState(2);
  const [names, setNames] = useState(["Spelare 1", "Spelare 2"]);
  const [difficulty, setDifficulty] = useState("amateur");
  const [winScore, setWinScore] = useState(15);
  const [maxDistance, setMaxDistance] = useState(25);
  const [perksOn, setPerksOn] = useState(true);
  const [pressOn, setPressOn] = useState(true);
  const [challengeOn, setChallengeOn] = useState(true);

  const [players, setPlayers] = useState([]);
  const [turnIdx, setTurnIdx] = useState(0);
  const [turn, setTurn] = useState(null);
  const [winnerIdx, setWinnerIdx] = useState(null);
  const [pendingPerk, setPendingPerk] = useState(null);
  const [pendingSwap, setPendingSwap] = useState(null);
  const [pendingMulligan, setPendingMulligan] = useState(false);
  const [pendingChallenge, setPendingChallenge] = useState(null);
  const [lastPerkEvent, setLastPerkEvent] = useState(null);

  const diff = DIFFICULTIES[difficulty];

  // Kräv inloggning för Friends Mode, och lås Spelare 1:s namn till kontots identitet.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user || null;
      setAccountUser(u);
      if (u) {
        const displayName = u.user_metadata?.display_name || u.email.split("@")[0];
        setNames((prev) => {
          const next = [...prev];
          next[0] = displayName;
          return next;
        });
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  const updateNumPlayers = (n) => {
    const clamped = Math.max(2, Math.min(10, n));
    setNumPlayers(clamped);
    setNames((prev) => {
      const next = [...prev];
      while (next.length < clamped) next.push(`Spelare ${next.length + 1}`);
      return next.slice(0, clamped);
    });
  };

  const buildTurn = (player, allScores, isFirst) => {
    const s = scoreFor(player.distance);

    if (isFirst) {
      return {
        baseDistance: player.distance,
        effectiveDistance: player.distance,
        kind: s.kind,
        pointsIfHit: s.points,
        basePoints: s.points,
        doubled: false,
        approachForced: false,
        throwsNeeded: s.throws,
        throwsDone: 0,
        throwHits: 0,
        hand: diff.hands[0],
        knee: false,
        weakHand: false,
        dx: 0,
        dy: 0,
        press: null,
        sabotageBy: null,
      };
    }

    let hand = diff.hands.length > 1 ? pick(diff.hands) : diff.hands[0];
    let knee = diff.kneeAvailable && Math.random() < 0.3;
    const weakHand = diff.weakHandAvailable && Math.random() < 0.15;

    const eff = player.effects;
    if (eff.forceHand) hand = eff.forceHand;
    if (eff.forceKnee) knee = true;

    // The depth step shown here isn't random — it's the step the player already took
    // as a result of their last throw (back on a hit, forward on a miss). Distance
    // itself never jumps around randomly, so it can't creep past the basket.
    const dy = player.lastStepDelta || 0;
    const dx = rollLateralStep(eff.pushSteps || 0);
    const effectiveDistance = player.distance;

    let es = scoreFor(effectiveDistance);
    let approachForced = false;
    // A "force approach" effect always upgrades the next throw to a 2-throw approach,
    // regardless of current distance — a bonus/harder challenge, not a distance fix-up.
    if (eff.forceApproach && es.kind === "putt") {
      es = { points: 2, kind: "approach", throws: 2 };
      approachForced = true;
    }

    // Press: 1/10 chance of a bonus challenge announced before the throw (if enabled).
    // Press is a multiplayer surprise mechanic and is skipped entirely in Solo Mode.
    let press = null;
    if (!soloMode && pressOn && Math.random() < 0.1) {
      press = pick(getPressTypes(language));
    }

    return {
      baseDistance: player.distance,
      effectiveDistance,
      kind: es.kind,
      pointsIfHit: es.points * (eff.doublePoints ? 2 : 1),
      basePoints: es.points,
      doubled: eff.doublePoints,
      approachForced,
      throwsNeeded: es.throws,
      throwsDone: 0,
      throwHits: 0,
      hand, knee, weakHand, dx, dy, press,
      sabotageBy: eff.sabotageBy || null,
    };
  };

  const startMatch = () => {
    setSoloMode(false);
    const initial = names.map((n, i) => ({
      name: n, score: 0, distance: diff.start, stats: emptyStats(),
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      trail: [{ dx: 0, distance: diff.start }],
      streak: 0, effects: emptyEffects(), mulligans: 0, worstDeficit: 0,
      bestStreak: 0, maxDistanceReached: diff.start, lastStepDelta: 0, throwLog: [],
    }));
    setWinnerIdx(null);
    setTurnIdx(0);
    setLastPerkEvent(null);
    setPendingChallenge(null);
    setScreen("match");
    const tn = buildTurn(initial[0], initial.map((p) => p.score), true);
    setPlayers(initial);
    setTurn(tn);
  };

  const startSoloMatch = () => {
    setSoloMode(true);
    const initial = [{
      name: t(language, "youLabel"), score: 0, distance: diff.start, stats: emptyStats(),
      color: PLAYER_COLORS[0],
      trail: [{ dx: 0, distance: diff.start }],
      streak: 0, effects: emptyEffects(), mulligans: 0, worstDeficit: 0,
      bestStreak: 0, maxDistanceReached: diff.start, lastStepDelta: 0, throwLog: [],
    }];
    setWinnerIdx(null);
    setTurnIdx(0);
    setLastPerkEvent(null);
    setPendingChallenge(null);
    setScreen("match");
    const tn = buildTurn(initial[0], initial.map((p) => p.score), true);
    setPlayers(initial);
    setTurn(tn);
  };

  const advanceTo = (nextIdx, currentPlayers) => {
    const leadScore = Math.max(...currentPlayers.map((p) => p.score));
    const deficit = currentPlayers[nextIdx].score - leadScore;
    const tn = buildTurn(currentPlayers[nextIdx], currentPlayers.map((p) => p.score), false);
    const next = [...currentPlayers];
    next[nextIdx] = {
      ...next[nextIdx],
      trail: [...next[nextIdx].trail, { dx: tn.dx, distance: tn.effectiveDistance }].slice(-24),
      effects: emptyEffects(),
      worstDeficit: Math.min(next[nextIdx].worstDeficit || 0, deficit),
    };
    setPlayers(next);
    setTurnIdx(nextIdx);
    setTurn(tn);
    setPendingChallenge(null);
  };

  const applyThrowResult = (hit) => {
    if (!turn) return;

    if (!hit && (players[turnIdx].mulligans || 0) > 0) {
      setPendingMulligan(true);
      return;
    }

    resolveThrow(hit);
  };

  const useMulligan = () => {
    setPlayers((prev) => {
      const next = [...prev];
      const p = { ...next[turnIdx] };
      p.mulligans = Math.max(0, (p.mulligans || 0) - 1);
      next[turnIdx] = p;
      return next;
    });
    setLastPerkEvent(t(language, "evMulliganUsed", { name: players[turnIdx].name }));
    setPendingMulligan(false);
  };

  const declineMulligan = () => {
    setPendingMulligan(false);
    resolveThrow(false);
  };

  const resolveThrow = (hit) => {
    const done = turn.throwsDone + 1;
    const hits = turn.throwHits + (hit ? 1 : 0);
    const finished = done >= turn.throwsNeeded;

    if (!finished) {
      setPlayers((prev) => {
        const next = [...prev];
        const p = { ...next[turnIdx] };
        p.throwLog = [...(p.throwLog || []), { hand: turn.hand, weakHand: turn.weakHand, distance: turn.effectiveDistance, hit }];
        next[turnIdx] = p;
        return next;
      });
      setTurn({ ...turn, throwsDone: done, throwHits: hits });
      return;
    }

    const allHit = hits === turn.throwsNeeded;
    let drawnPerk = null;

    let resolvedPlayers = (() => {
      const next = [...players];
      const p = { ...next[turnIdx] };
      const st = { ...p.stats };

      if (turn.kind === "putt") {
        st.puttAttempts += 1;
        if (allHit) { st.puttMakes += 1; if (turn.effectiveDistance > st.longestPutt) st.longestPutt = turn.effectiveDistance; }
      } else {
        st.approachAttempts += 1;
        if (allHit) { st.approachMakes += 1; if (turn.effectiveDistance > st.longestApproach) st.longestApproach = turn.effectiveDistance; }
      }
      if (turn.hand === "forehand") { st.forehand += 1; if (allHit) st.forehandMakes += 1; }
      else { st.backhand += 1; if (allHit) st.backhandMakes += 1; }

      p.stats = st;
      p.throwLog = [...(p.throwLog || []), { hand: turn.hand, weakHand: turn.weakHand, distance: turn.effectiveDistance, hit }];

      if (allHit) {
        p.score += turn.pointsIfHit + (turn.knee ? 1 : 0);
        p.streak = (p.streak || 0) + 1;
        p.bestStreak = Math.max(p.bestStreak || 0, p.streak);
        if (turn.press && turn.press.id === "mulligan") {
          p.mulligans = (p.mulligans || 0) + 1;
        }
        if (!soloMode && perksOn && p.streak > 0 && p.streak % 3 === 0) {
          const pool = getPerks(language);
          drawnPerk = pick(pool.filter((pk) => !pk.golden || Math.random() < 0.15));
        }
      } else {
        p.streak = 0;
      }

      // Distance always moves now: back (harder) on a hit, forward (easier) on a miss.
      // Step size depends on how far out the throw was taken from.
      const stepSize = depthStepSize(turn.baseDistance);
      p.distance = allHit
        ? Math.min(maxDistance, turn.baseDistance + stepSize)
        : Math.max(MIN_DISTANCE, turn.baseDistance - stepSize);
      p.lastStepDelta = p.distance - turn.baseDistance;
      p.maxDistanceReached = Math.max(p.maxDistanceReached || p.distance, p.distance);

      next[turnIdx] = p;
      return next;
    })();

    let eventMsgs = [];

    if (allHit && turn.press && turn.press.id === "kaos") {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const mag = weightedMagnitude();
      resolvedPlayers = resolvedPlayers.map((pl) => ({
        ...pl,
        distance: Math.max(1, Math.min(maxDistance, pl.distance + dir * mag)),
      }));
      eventMsgs.push(t(language, "evKaos", { mag, dir: dir > 0 ? t(language, "dirBack") : t(language, "dirForward") }));
    } else if (allHit && turn.press && turn.press.id === "mulligan") {
      eventMsgs.push(t(language, "evMulliganWon", { name: resolvedPlayers[turnIdx].name }));
    } else if (allHit && turn.press && turn.press.id === "approach") {
      resolvedPlayers = resolvedPlayers.map((pl, i) =>
        i === turnIdx ? { ...pl, effects: { ...pl.effects, forceApproach: true } } : pl
      );
    }

    // Challenge: a bystander bet against (or for) this throw before it happened.
    if (pendingChallenge) {
      const challengerIdx = pendingChallenge.challengerIdx;
      resolvedPlayers = resolvedPlayers.map((pl, i) => {
        if (i !== challengerIdx) return pl;
        const delta = allHit ? -1 : 1;
        return { ...pl, score: Math.max(0, pl.score + delta) };
      });
      const challengerName = resolvedPlayers[challengerIdx].name;
      eventMsgs.push(allHit ? t(language, "evChallengeLose", { name: challengerName }) : t(language, "evChallengeWin", { name: challengerName }));
    }

    if (eventMsgs.length) setLastPerkEvent(eventMsgs.join(" "));
    setPendingChallenge(null);

    setPlayers(resolvedPlayers);
    setTurn(null);

    const winner = resolvedPlayers[turnIdx];
    if (winner.score >= winScore) {
      setWinnerIdx(turnIdx);
      if (soloMode) {
        const st = winner.stats;
        soloHistory.push({
          score: winner.score,
          puttPct: st.puttAttempts ? st.puttMakes / st.puttAttempts : 0,
          approachPct: st.approachAttempts ? st.approachMakes / st.approachAttempts : 0,
          longestPutt: st.longestPutt,
          longestApproach: st.longestApproach,
          bestStreak: winner.bestStreak || 0,
          highestDistance: winner.maxDistanceReached || winner.distance,
        });
        setScreen("soloResults");
      } else {
        setScreen("results");
      }
      return;
    }

    const nextIdx = (turnIdx + 1) % resolvedPlayers.length;

    if (allHit && turn.press && turn.press.id === "byt") {
      setPendingSwap({ drawerIdx: turnIdx, nextIdx });
      return;
    }

    if (drawnPerk) {
      setPendingPerk({ perk: drawnPerk, drawerIdx: turnIdx, nextIdx });
    } else {
      advanceTo(nextIdx, resolvedPlayers);
    }
  };

  const resolvePerk = (targetIdx) => {
    if (!pendingPerk) return;
    const { perk, drawerIdx, nextIdx } = pendingPerk;
    const next = players.map((p) => ({ ...p, effects: { ...p.effects } }));
    const target = next[targetIdx];

    if (perk.negative && target.effects.immune) {
      target.effects = emptyEffects();
      setLastPerkEvent(t(language, "evImmuneBlocked", { target: target.name, perk: perk.label }));
    } else if (perk.id === "steal") {
      const drawer = next[drawerIdx];
      const stolen = Math.min(1, target.score);
      target.score -= stolen;
      drawer.score += stolen;
      setLastPerkEvent(t(language, "evStolePoints", { drawer: drawer.name, amount: stolen, target: target.name }));
    } else {
      const eff = emptyEffects();
      if (perk.id === "double") eff.doublePoints = true;
      if (perk.id === "forceForehand") eff.forceHand = "forehand";
      if (perk.id === "forceBackhand") eff.forceHand = "backhand";
      if (perk.id === "forceKnee") eff.forceKnee = true;
      if (perk.id === "pushSteps") eff.pushSteps = 2;
      if (perk.id === "immune") eff.immune = true;
      if (perk.id === "approach") eff.forceApproach = true;
      if (perk.id === "sabotage") eff.sabotageBy = next[drawerIdx].name;
      target.effects = eff;
      target.stats = { ...target.stats, perksCount: (target.stats.perksCount || 0) + 1 };
      setLastPerkEvent(t(language, "evPerkGiven", { target: target.name, perk: perk.label }));
    }

    setPendingPerk(null);
    advanceTo(nextIdx, next);
  };

  const resolveSwap = (targetIdx) => {
    if (!pendingSwap) return;
    const { drawerIdx, nextIdx } = pendingSwap;
    const next = players.map((p) => ({ ...p }));
    const a = next[drawerIdx];
    const b = next[targetIdx];
    const tmp = a.distance;
    a.distance = b.distance;
    b.distance = tmp;
    const aLastDx = a.trail[a.trail.length - 1]?.dx || 0;
    const bLastDx = b.trail[b.trail.length - 1]?.dx || 0;
    a.trail = [...a.trail, { dx: aLastDx, distance: a.distance }].slice(-24);
    b.trail = [...b.trail, { dx: bLastDx, distance: b.distance }].slice(-24);
    setLastPerkEvent(t(language, "evSwap", { a: a.name, b: b.name }));
    setPlayers(next);
    setPendingSwap(null);
    advanceTo(nextIdx, next);
  };

  const resetAll = () => {
    setScreen("setup");
    setSoloMode(false);
    setPlayers([]);
    setTurn(null);
    setWinnerIdx(null);
    setPendingPerk(null);
    setPendingSwap(null);
    setPendingMulligan(false);
    setPendingChallenge(null);
    setLastPerkEvent(null);
  };

  const replaySolo = () => {
    setWinnerIdx(null);
    setPendingPerk(null);
    setPendingSwap(null);
    setPendingMulligan(false);
    setPendingChallenge(null);
    setLastPerkEvent(null);
    startSoloMatch();
  };

  const currentPlayer = players[turnIdx];

  if (accountUser === undefined) {
    return (
      <div style={{
        minHeight: "100vh", background: T.bg, color: T.inkDim, display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: BODY_FONT,
      }}>
        Laddar…
      </div>
    );
  }
  if (accountUser === null) {
    return null; // redirect till /login pågår
  }

  return (
    <div style={{
      minHeight: "100vh", background: "rgba(6, 18, 11, 0.72)",
      color: T.ink, fontFamily: BODY_FONT, display: "flex", justifyContent: "center",
      padding: "24px 16px", boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Header screen={screen} onReset={resetAll} lang={language} />

        {screen === "setup" && (
          <SetupScreen
            lang={language}
            numPlayers={numPlayers} updateNumPlayers={updateNumPlayers}
            names={names} setNames={setNames}
            difficulty={difficulty} setDifficulty={setDifficulty}
            winScore={winScore} setWinScore={setWinScore}
            maxDistance={maxDistance} setMaxDistance={setMaxDistance}
            perksOn={perksOn} setPerksOn={setPerksOn}
            pressOn={pressOn} setPressOn={setPressOn}
            challengeOn={challengeOn} setChallengeOn={setChallengeOn}
            onStart={startMatch}
            onShowRules={() => setScreen("rules")}
            onBack={() => router.push("/")}
            lockedFirstName
          />
        )}

        {screen === "rules" && (
          <RulesScreen lang={language} onBack={() => setScreen("setup")} />
        )}

        {screen === "match" && currentPlayer && turn && !pendingPerk && !pendingSwap && (
          <MatchScreen
            lang={language}
            players={players} turnIdx={turnIdx} turn={turn}
            currentPlayer={currentPlayer}
            onResult={applyThrowResult}
            lastPerkEvent={lastPerkEvent}
            maxDistance={maxDistance}
            pendingMulligan={pendingMulligan}
            onUseMulligan={useMulligan}
            onDeclineMulligan={declineMulligan}
            pendingChallenge={pendingChallenge}
            onSetChallenge={(idx) => setPendingChallenge({ challengerIdx: idx })}
            challengeOn={challengeOn}
          />
        )}

        {screen === "match" && pendingPerk && (
          <PerkModal lang={language} players={players} pendingPerk={pendingPerk} onResolve={resolvePerk} />
        )}

        {screen === "match" && pendingSwap && (
          <SwapModal lang={language} players={players} pendingSwap={pendingSwap} onResolve={resolveSwap} />
        )}

        {screen === "results" && winnerIdx !== null && (
          <ResultsScreen lang={language} players={players} winnerIdx={winnerIdx} onReplay={resetAll} />
        )}

        {screen === "soloResults" && winnerIdx !== null && (
          <SoloResultsScreen lang={language} player={players[winnerIdx]} onReplay={replaySolo} onHome={resetAll} />
        )}
      </div>
    </div>
  );
}

function Header({ screen, onReset, lang }) {
  return (
    <div style={{ marginBottom: 20, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 26, letterSpacing: 0.5, color: T.ink }}>
          PUTT <span style={{ color: T.accent }}>BATTLE</span>
        </div>
        <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, marginTop: 2 }}>
          {t(lang, "tagline")}
        </div>
      </div>
      {(screen === "match" || screen === "results" || screen === "soloResults") && (
        <button onClick={onReset} style={{
          background: "none", border: `1px solid ${T.surfaceLine}`, borderRadius: 8,
          color: T.inkDim, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
          fontFamily: BODY_FONT, fontSize: 12,
        }}>
          <RotateCcw size={13} /> {t(lang, "newMatch")}
        </button>
      )}
    </div>
  );
}

function SetupScreen({ lang, numPlayers, updateNumPlayers, names, setNames, difficulty, setDifficulty, winScore, setWinScore, maxDistance, setMaxDistance, perksOn, setPerksOn, pressOn, setPressOn, challengeOn, setChallengeOn, onStart, onShowRules, onBack, lockedFirstName }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={onBack} style={{
        alignSelf: "flex-start", background: "none", border: "none", color: T.inkDim,
        cursor: "pointer", fontFamily: BODY_FONT, fontSize: 13, padding: 0,
      }}>
        {STRINGS[lang].backToStart}
      </button>

      <Section title={STRINGS[lang].sectionPlayers}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <RoundBtn onClick={() => updateNumPlayers(numPlayers - 1)}><Minus size={16} /></RoundBtn>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22, minWidth: 28, textAlign: "center" }}>{numPlayers}</div>
          <RoundBtn onClick={() => updateNumPlayers(numPlayers + 1)}><Plus size={16} /></RoundBtn>
          <span style={{ color: T.inkDim, fontSize: 13 }}>{STRINGS[lang].playersSuffix}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {names.map((n, i) => {
            const locked = lockedFirstName && i === 0;
            return (
              <input
                key={i}
                value={n}
                readOnly={locked}
                onChange={(e) => {
                  if (locked) return;
                  setNames((prev) => { const c = [...prev]; c[i] = e.target.value; return c; });
                }}
                style={{
                  background: locked ? T.bg2 : T.surface,
                  border: `1px solid ${locked ? T.accent : T.surfaceLine}`, borderRadius: 8,
                  padding: "10px 12px", color: T.ink, fontFamily: BODY_FONT, fontSize: 14,
                  cursor: locked ? "not-allowed" : "text",
                }}
              />
            );
          })}
        </div>
      </Section>

      <Section title={STRINGS[lang].sectionDifficulty}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(DIFFICULTIES).map(([key, d]) => (
            <Pill key={key} active={difficulty === key} onClick={() => setDifficulty(key)}>{STRINGS[lang][d.key]}</Pill>
          ))}
        </div>
      </Section>

      <Section title={STRINGS[lang].sectionWinScore}>
        <div style={{ display: "flex", gap: 8 }}>
          {[10, 15, 20, 30].map((v) => (
            <Pill key={v} active={winScore === v} onClick={() => setWinScore(v)}>{v}</Pill>
          ))}
        </div>
      </Section>

      <Section title={STRINGS[lang].sectionMaxDistance}>
        <div style={{ display: "flex", gap: 8 }}>
          {[20, 25, 30].map((v) => (
            <Pill key={v} active={maxDistance === v} onClick={() => setMaxDistance(v)}>{v} m</Pill>
          ))}
        </div>
      </Section>

      <Section title="">
        <div style={{ display: "flex", gap: 8 }}>
          <GreenPill active={perksOn} onClick={() => setPerksOn(!perksOn)}>{STRINGS[lang].sectionPerks}</GreenPill>
          <GreenPill active={pressOn} onClick={() => setPressOn(!pressOn)}>{STRINGS[lang].sectionPress}</GreenPill>
          <GreenPill active={challengeOn} onClick={() => setChallengeOn(!challengeOn)}>{STRINGS[lang].sectionChallenge}</GreenPill>
        </div>
      </Section>

      <Section title={STRINGS[lang].sectionBeforeStart}>
        <div style={{
          background: T.surface, border: `1px solid ${T.surfaceLine}`, borderRadius: 10,
          padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.5 }}>
            {STRINGS[lang].onboardingMarker}
          </div>
        </div>
      </Section>

      <button onClick={onShowRules} style={{
        background: "none", border: `1px solid ${T.surfaceLine}`, borderRadius: 10,
        color: T.inkDim, padding: "10px", cursor: "pointer", fontFamily: BODY_FONT, fontSize: 13,
      }}>
        {STRINGS[lang].rulesLink}
      </button>

      <button onClick={onStart} style={{
        marginTop: 8, padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
        background: T.accent, color: T.accentInk, fontFamily: DISPLAY_FONT, fontSize: 18,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        {STRINGS[lang].startMatch} <ChevronRight size={20} />
      </button>
    </div>
  );
}

function StartScreen({ lang, setLanguage, onPlayFriends, onPlaySolo }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
      <img
        src={LOGO_DATA_URI}
        alt="Putt Battle"
        style={{ width: 200, height: 200, borderRadius: 32 }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        {LANGUAGES.map((code) => (
          <Pill key={code} active={lang === code} onClick={() => setLanguage(code)}>{LANG_LABEL[code]}</Pill>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", marginTop: 8 }}>
        <button onClick={onPlayFriends} style={{
          padding: "22px", borderRadius: 16, border: "none", cursor: "pointer",
          background: T.accent, color: T.accentInk, fontFamily: DISPLAY_FONT, fontSize: 20,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          {STRINGS[lang].startPlayFriends}
        </button>
        <button onClick={onPlaySolo} style={{
          padding: "22px", borderRadius: 16, cursor: "pointer",
          background: "transparent", color: T.ink, border: `2px solid ${T.surfaceLine}`,
          fontFamily: DISPLAY_FONT, fontSize: 20,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          {STRINGS[lang].startPlaySolo}
        </button>
      </div>

      <a
        href={PRIVACY_FILES[lang] || PRIVACY_FILES.swe}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 12, color: "#999", textDecoration: "underline", marginTop: 8 }}
      >
        {STRINGS[lang].privacyPolicyLabel}
      </a>
    </div>
  );
}

function SoloSetupScreen({ lang, difficulty, setDifficulty, winScore, setWinScore, maxDistance, setMaxDistance, onStart, onShowRules, onBack }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={onBack} style={{
        alignSelf: "flex-start", background: "none", border: "none", color: T.inkDim,
        cursor: "pointer", fontFamily: BODY_FONT, fontSize: 13, padding: 0,
      }}>
        {STRINGS[lang].backToStart}
      </button>

      <Section title={STRINGS[lang].sectionDifficulty}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(DIFFICULTIES).map(([key, d]) => (
            <Pill key={key} active={difficulty === key} onClick={() => setDifficulty(key)}>{STRINGS[lang][d.key]}</Pill>
          ))}
        </div>
      </Section>

      <Section title={STRINGS[lang].sectionWinScore}>
        <div style={{ display: "flex", gap: 8 }}>
          {[10, 15, 20, 30].map((v) => (
            <Pill key={v} active={winScore === v} onClick={() => setWinScore(v)}>{v}</Pill>
          ))}
        </div>
      </Section>

      <Section title={STRINGS[lang].sectionMaxDistance}>
        <div style={{ display: "flex", gap: 8 }}>
          {[20, 25, 30].map((v) => (
            <Pill key={v} active={maxDistance === v} onClick={() => setMaxDistance(v)}>{v} m</Pill>
          ))}
        </div>
      </Section>

      <button onClick={onShowRules} style={{
        background: "none", border: `1px solid ${T.surfaceLine}`, borderRadius: 10,
        color: T.inkDim, padding: "10px", cursor: "pointer", fontFamily: BODY_FONT, fontSize: 13,
      }}>
        {STRINGS[lang].rulesLink}
      </button>

      <button onClick={onStart} style={{
        marginTop: 8, padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
        background: T.accent, color: T.accentInk, fontFamily: DISPLAY_FONT, fontSize: 18,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        {STRINGS[lang].startMatch} <ChevronRight size={20} />
      </button>
    </div>
  );
}

function SoloResultsScreen({ lang, player, onReplay, onHome }) {
  const s = STRINGS[lang];
  const st = player.stats;
  const totalAttempts = st.puttAttempts + st.approachAttempts;
  const totalMakes = st.puttMakes + st.approachMakes;

  // soloHistory already includes the just-finished session (pushed in resolveThrow).
  const allTime = {
    highScore: Math.max(...soloHistory.map((h) => h.score)),
    bestStreak: Math.max(...soloHistory.map((h) => h.bestStreak)),
    puttPct: Math.max(...soloHistory.map((h) => h.puttPct)),
    longestPutt: Math.max(...soloHistory.map((h) => h.longestPutt)),
    longestApproach: Math.max(...soloHistory.map((h) => h.longestApproach)),
    highestDistance: Math.max(...soloHistory.map((h) => h.highestDistance)),
  };
  const thisSession = soloHistory[soloHistory.length - 1];
  const isNew = (key, val) => allTime[key] === val && val > 0;

  const records = [
    [s.recHighScore, player.score, isNew("highScore", player.score)],
    [s.recBestStreak, player.bestStreak || 0, isNew("bestStreak", player.bestStreak || 0)],
    [s.recPuttPct, `${Math.round((thisSession.puttPct || 0) * 100)}%`, isNew("puttPct", thisSession.puttPct)],
    [s.recLongestPutt, st.longestPutt ? `${st.longestPutt}m` : "–", isNew("longestPutt", st.longestPutt)],
    [s.recLongestApproach, st.longestApproach ? `${st.longestApproach}m` : "–", isNew("longestApproach", st.longestApproach)],
    [s.recHighestDistance, `${player.maxDistanceReached || player.distance}m`, isNew("highestDistance", player.maxDistanceReached || player.distance)],
  ];

  const items = [
    [s.statHit, pct(totalMakes, totalAttempts)],
    [s.statPutt, pct(st.puttMakes, st.puttAttempts)],
    [s.statApproach, pct(st.approachMakes, st.approachAttempts)],
    [s.statForehand, pct(st.forehandMakes, st.forehand)],
    [s.statBackhand, pct(st.backhandMakes, st.backhand)],
    [s.statLongestPutt, st.longestPutt ? `${st.longestPutt}m` : "–"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, textTransform: "uppercase" }}>{s.soloResultsTitle}</div>
        <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, marginTop: 10 }}>{s.finalScoreLabel}</div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 52, color: T.accent }}>{player.score}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, fontFamily: MONO_FONT }}>
        {items.map(([label, val]) => (
          <div key={label} style={{ background: T.bg2, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
            <div style={{ fontSize: 15, color: T.chain }}>{val}</div>
            <div style={{ fontSize: 9, color: T.inkDim, marginTop: 2, textTransform: "uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      <ThrowBreakdown lang={lang} throwLog={player.throwLog} />
      <Section title={STRINGS[lang].personalRecordsTitle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {records.map(([label, val, isNewRec]) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: T.surface, border: `1px solid ${isNewRec ? T.accent : T.surfaceLine}`, borderRadius: 10, padding: "10px 14px",
            }}>
              <div style={{ fontSize: 13, color: T.ink }}>{label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {isNewRec && <span style={{ fontSize: 11, color: T.accent, fontFamily: MONO_FONT }}>{s.newRecordBadge}</span>}
                <span style={{ fontFamily: DISPLAY_FONT, fontSize: 16, color: T.accent }}>{val}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ fontSize: 11, color: T.inkDim, textAlign: "center" }}>
        {t(lang, "sessionsPlayedLabel")}: {soloHistory.length}
      </div>
      <div style={{ fontSize: 11, color: T.inkDim, lineHeight: 1.5, textAlign: "center" }}>
        {s.noHistoryNote}
      </div>

      <button onClick={onReplay} style={{
        padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
        background: T.accent, color: T.accentInk, fontFamily: DISPLAY_FONT, fontSize: 16,
      }}>
        {s.playAgainSolo}
      </button>
      <button onClick={onHome} style={{
        padding: "14px", borderRadius: 12, cursor: "pointer",
        background: "none", border: `1px solid ${T.surfaceLine}`, color: T.ink,
        fontFamily: DISPLAY_FONT, fontSize: 14,
      }}>
        {s.toStartScreen}
      </button>
    </div>
  );
}

function RulesSection({ title, paragraphs, list, closing }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.surfaceLine}`, borderRadius: 10,
      padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 15, color: T.accent }}>{title}</div>
      {(paragraphs || []).map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: T.inkDim, lineHeight: 1.5 }}>{p}</div>
      ))}
      {list && (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 2 }}>
          {list.items.map((item, i) => (
            <div key={i} style={{ fontSize: 13, color: T.inkDim, lineHeight: 1.5 }}>
              {list.ordered ? `${i + 1}. ` : "• "}{item}
            </div>
          ))}
        </div>
      )}
      {closing && (
        <div style={{ fontSize: 13, color: T.ink, fontWeight: 600, marginTop: 2 }}>{closing}</div>
      )}
    </div>
  );
}

function RulesScreen({ lang, onBack }) {
  const s = STRINGS[lang];
  const sections = [
    { title: s.objectiveTitle, paragraphs: [s.objectiveDesc] },
    { title: s.howToPlayTitle, list: { ordered: true, items: s.howToPlaySteps }, closing: s.howToPlayClosing },
    { title: s.scoringTitle, list: { ordered: false, items: s.scoringItems } },
    { title: s.sectionPerks, paragraphs: [s.perksIntroDesc, s.perksPhilosophy, s.rulesPerksDesc] },
    { title: s.sectionPress, paragraphs: [s.rulesPressDesc] },
    { title: s.sectionChallenge, paragraphs: [s.rulesChallengeDesc] },
    { title: s.fairPlayTitle, paragraphs: [s.fairPlayIntro, s.fairPlayNoReferees], list: { ordered: false, items: s.fairPlayItems }, closing: s.fairPlayClosing },
    { title: s.rulesStepsTitle, paragraphs: [s.mechanicsHint] },
    { title: s.mostImportantTitle, paragraphs: [s.mostImportantDesc] },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22 }}>{s.rulesTitle}</div>
      {sections.map((sec, i) => (
        <RulesSection key={i} title={sec.title} paragraphs={sec.paragraphs} list={sec.list} closing={sec.closing} />
      ))}
      <button onClick={onBack} style={{
        background: "none", border: `1px solid ${T.surfaceLine}`, borderRadius: 10,
        color: T.ink, padding: "12px", cursor: "pointer", fontFamily: BODY_FONT, fontWeight: 600, fontSize: 14,
      }}>
        {s.backButton}
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function RoundBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 34, height: 34, borderRadius: "50%", border: `1px solid ${T.surfaceLine}`,
      background: T.surface, color: T.ink, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {children}
    </button>
  );
}

function MatchScreen({ lang, players, turnIdx, turn, currentPlayer, onResult, lastPerkEvent, maxDistance, pendingMulligan, onUseMulligan, onDeclineMulligan, pendingChallenge, onSetChallenge, challengeOn }) {
  const [showChallengePicker, setShowChallengePicker] = useState(false);
  const throwLeft = turn.throwsNeeded - turn.throwsDone;
  const handLabel = turn.hand === "forehand" ? STRINGS[lang].statForehand : STRINGS[lang].statBackhand;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {players.map((p, i) => (
          <div key={i} style={{
            flex: "0 0 auto", minWidth: 88, padding: "8px 10px", borderRadius: 10,
            background: i === turnIdx ? T.accent : T.surface,
            border: `1px solid ${i === turnIdx ? T.accent : T.surfaceLine}`,
            color: i === turnIdx ? T.accentInk : T.ink,
          }}>
            <div style={{ fontSize: 11, fontFamily: MONO_FONT, opacity: 0.8, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, display: "inline-block", flexShrink: 0 }} />
              {p.name} {p.effects?.immune && <Shield size={10} />} {p.mulligans > 0 && `🔁${p.mulligans}`}
            </div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22 }}>{p.score}</div>
          </div>
        ))}
      </div>

      {lastPerkEvent && (
        <div style={{
          background: T.bg2, border: `1px solid ${T.gold}`, borderRadius: 10, padding: "8px 12px",
          fontSize: 12, color: T.gold, display: "flex", alignItems: "center", gap: 6,
        }}>
          <Sparkles size={13} /> {lastPerkEvent}
        </div>
      )}

      {/* The spelledare voice: big, shouted, one thing at a time */}
      <div style={{ textAlign: "center", padding: "6px 0" }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 40, lineHeight: 1.05, color: currentPlayer.color }}>
          {currentPlayer.name.toUpperCase()}!
        </div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 26, color: T.accent, marginTop: 4 }}>
          {handLabel.toUpperCase()}!
        </div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22, color: T.ink, marginTop: 4 }}>
          {stepInstruction(lang, turn).toUpperCase()}
        </div>
        {turn.sabotageBy && (
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 18, color: T.press, marginTop: 4 }}>
            {t(lang, "sabotageTag", { name: turn.sabotageBy }).toUpperCase()}!
          </div>
        )}
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.surfaceLine}`, borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, textTransform: "uppercase" }}>{t(lang, "nowThrowing")}</div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 18, color: currentPlayer.color }}>{currentPlayer.name}</div>
            <div style={{ fontFamily: MONO_FONT, fontSize: 10, color: T.inkDim, marginTop: 2 }}>
              {t(lang, "streakLabel", { n: currentPlayer.streak || 0 })}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim }}>{t(lang, "distanceLabel")}</div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20, color: T.accent }}>{turn.effectiveDistance}m</div>
            {turn.effectiveDistance !== turn.baseDistance && (
              <div style={{ fontFamily: MONO_FONT, fontSize: 10, color: T.inkDim }}>
                {t(lang, "baseDistanceNote", { base: turn.baseDistance, sign: turn.dy < 0 ? t(lang, "signForward") : t(lang, "signBack") })}
              </div>
            )}
          </div>
        </div>

        {turn.press && (
          <div style={{
            margin: "14px 0 0", padding: "10px 14px", borderRadius: 10,
            background: T.bg2, border: `1px solid ${T.press}`,
          }}>
            <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.press, textTransform: "uppercase", marginBottom: 2 }}>
              {t(lang, "pressPrefix", { label: turn.press.label })}
            </div>
            <div style={{ fontSize: 13, color: T.ink }}>{turn.press.desc}</div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
          <FieldMap players={players} turnIdx={turnIdx} maxDistance={maxDistance} lang={lang} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 8 }}>
          <Tag>{handLabel}</Tag>
          {turn.knee && <Tag accent>{t(lang, "tagKnee")}</Tag>}
          {turn.weakHand && <Tag accent>{t(lang, "tagWeakHand")}</Tag>}
          {turn.doubled && <Tag accent>{t(lang, "tagDoublePoints")}</Tag>}
          {turn.approachForced && <Tag accent>{t(lang, "tagApproachForced")}</Tag>}
          {turn.sabotageBy && <Tag accent>{t(lang, "sabotageTag", { name: turn.sabotageBy })}</Tag>}
          {turn.kind === "approach" && <Tag>{t(lang, "tagApproach", { n: turn.throwsNeeded })}</Tag>}
        </div>

        {turn.kind === "approach" && (
          <div style={{ textAlign: "center", fontFamily: MONO_FONT, fontSize: 12, color: T.inkDim, marginBottom: 4 }}>
            {t(lang, "throwProgress", { done: turn.throwsDone + 1, needed: turn.throwsNeeded, left: throwLeft })}
          </div>
        )}
      </div>

      {/* Challenge: a bystander can bet on this throw before the result is registered */}
      {challengeOn && players.length > 1 && !pendingMulligan && (
        pendingChallenge ? (
          <div style={{
            textAlign: "center", padding: "8px 12px", borderRadius: 10,
            background: T.bg2, border: `1px solid ${T.press}`, color: T.press,
            fontFamily: DISPLAY_FONT, fontSize: 14,
          }}>
            {t(lang, "challengeBadge", { name: players[pendingChallenge.challengerIdx].name })}
          </div>
        ) : showChallengePicker ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, textAlign: "center" }}>
              {t(lang, "challengeWho", { name: currentPlayer.name })}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {players.map((p, i) => i !== turnIdx && (
                <button key={i} onClick={() => { onSetChallenge(i); setShowChallengePicker(false); }} style={{
                  padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                  background: T.bg2, color: T.ink, border: `1px solid ${T.surfaceLine}`,
                  fontFamily: BODY_FONT, fontWeight: 600, fontSize: 13,
                }}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button onClick={() => setShowChallengePicker(true)} style={{
            alignSelf: "center", padding: "8px 16px", borderRadius: 999, cursor: "pointer",
            background: "transparent", color: T.press, border: `1px solid ${T.press}`,
            fontFamily: BODY_FONT, fontWeight: 700, fontSize: 13,
          }}>
            {t(lang, "challengeButton")}
          </button>
        )
      )}

      {pendingMulligan ? (
        <div style={{
          background: T.surface, border: `1.5px solid ${T.press}`, borderRadius: 14,
          padding: 16, display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 17, color: T.press }}>{t(lang, "missedTitle")}</div>
          <div style={{ fontSize: 13, color: T.inkDim }}>{t(lang, "mulliganPrompt")}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onDeclineMulligan} style={{
              flex: 1, padding: "12px 0", borderRadius: 10, cursor: "pointer",
              background: "transparent", color: T.inkDim, border: `1px solid ${T.surfaceLine}`,
              fontFamily: BODY_FONT, fontWeight: 600, fontSize: 14,
            }}>
              {t(lang, "mulliganDecline")}
            </button>
            <button onClick={onUseMulligan} style={{
              flex: 1, padding: "12px 0", borderRadius: 10, cursor: "pointer", border: "none",
              background: T.press, color: T.accentInk, fontFamily: BODY_FONT, fontWeight: 700, fontSize: 14,
            }}>
              {t(lang, "mulliganUse")}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => onResult(false)} style={{
            flex: 1, padding: "20px 0", borderRadius: 14, cursor: "pointer",
            background: "transparent", color: T.bad,
            border: `2px solid ${T.bad}`,
            fontFamily: DISPLAY_FONT, fontSize: 18,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}>
            <X size={26} /> {t(lang, "missButton")}
          </button>
          <button onClick={() => onResult(true)} style={{
            flex: 1, padding: "20px 0", borderRadius: 14, border: "none", cursor: "pointer",
            background: T.good, color: T.accentInk, fontFamily: DISPLAY_FONT, fontSize: 18,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}>
            <Check size={26} /> {t(lang, "hitButton")}
          </button>
        </div>
      )}
    </div>
  );
}


function PerkModal({ lang, players, pendingPerk, onResolve }) {
  const { perk, drawerIdx } = pendingPerk;
  const drawer = players[drawerIdx];
  return (
    <div style={{
      background: T.surface, border: `1.5px solid ${perk.golden ? T.gold : T.accent}`,
      borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Sparkles size={18} color={perk.golden ? T.gold : T.accent} />
        <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, textTransform: "uppercase" }}>
          {perk.golden ? t(lang, "perkGolden") : t(lang, "perkNormal")} · {t(lang, "perkStreakSuffix", { name: drawer.name })}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22 }}>{perk.label}</div>
        <div style={{ color: T.inkDim, fontSize: 13, marginTop: 4 }}>{perk.desc}</div>
      </div>
      <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, marginTop: 4 }}>
        {t(lang, "publikrostPrefix")}{t(lang, "perkWhoGets")}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onClick={() => onResolve(drawerIdx)}
          style={{
            padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.accent}`,
            background: "transparent", color: T.accent, fontFamily: BODY_FONT, fontWeight: 600,
            fontSize: 14, cursor: "pointer", textAlign: "left",
          }}
        >
          {t(lang, "perkUseSelf", { name: drawer.name })}
        </button>
        {players.map((p, i) => i !== drawerIdx && (
          <button
            key={i}
            onClick={() => onResolve(i)}
            style={{
              padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.surfaceLine}`,
              background: T.bg2, color: T.ink, fontFamily: BODY_FONT, fontWeight: 600,
              fontSize: 14, cursor: "pointer", textAlign: "left",
            }}
          >
            {t(lang, "perkGiveTo", { name: p.name })}
          </button>
        ))}
      </div>
    </div>
  );
}

function SwapModal({ lang, players, pendingSwap, onResolve }) {
  const { drawerIdx } = pendingSwap;
  const drawer = players[drawerIdx];
  return (
    <div style={{
      background: T.surface, border: `1.5px solid ${T.press}`,
      borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Sparkles size={18} color={T.press} />
        <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, textTransform: "uppercase" }}>
          {t(lang, "swapKicker", { name: drawer.name })}
        </div>
      </div>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20 }}>{t(lang, "publikrostPrefix")}{t(lang, "swapQuestion")}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {players.map((p, i) => i !== drawerIdx && (
          <button
            key={i}
            onClick={() => onResolve(i)}
            style={{
              padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.surfaceLine}`,
              background: T.bg2, color: T.ink, fontFamily: BODY_FONT, fontWeight: 600,
              fontSize: 14, cursor: "pointer", textAlign: "left",
              display: "flex", justifyContent: "space-between",
            }}
          >
            <span>{t(lang, "swapWith", { name: p.name })}</span>
            <span style={{ color: T.inkDim }}>{p.distance}m</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Tag({ children, accent }) {
  return (
    <span style={{
      padding: "5px 10px", borderRadius: 999, fontSize: 12, fontFamily: BODY_FONT, fontWeight: 600,
      background: accent ? T.accent : T.bg2, color: accent ? T.accentInk : T.inkDim,
      border: `1px solid ${accent ? T.accent : T.surfaceLine}`,
    }}>
      {children}
    </span>
  );
}

function pct(makes, attempts) {
  if (!attempts) return "–";
  return `${Math.round((makes / attempts) * 100)}%`;
}

// Breaks a player's throw-by-throw log into hit-rates by hand (forehand/backhand/svag hand)
// and by distance bracket, for the detailed stats page.
function computeBreakdowns(throwLog) {
  const hand = {
    forehand: { a: 0, h: 0 },
    backhand: { a: 0, h: 0 },
    weak: { a: 0, h: 0 },
  };
  const dist = [
    { label: "3–10m", min: 3, max: 10, a: 0, h: 0 },
    { label: "11–15m", min: 11, max: 15, a: 0, h: 0 },
    { label: "16–20m", min: 16, max: 20, a: 0, h: 0 },
    { label: "21–30m", min: 21, max: 30, a: 0, h: 0 },
  ];
  (throwLog || []).forEach((t) => {
    const key = t.weakHand ? "weak" : t.hand;
    if (hand[key]) {
      hand[key].a += 1;
      if (t.hit) hand[key].h += 1;
    }
    const bucket = dist.find((b) => t.distance >= b.min && t.distance <= b.max);
    if (bucket) {
      bucket.a += 1;
      if (t.hit) bucket.h += 1;
    }
  });
  return { hand, dist };
}

function BreakdownRow({ label, a, h }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: T.bg2, borderRadius: 8, padding: "8px 12px",
    }}>
      <span style={{ fontSize: 13, color: T.ink }}>{label}</span>
      <span style={{ fontFamily: MONO_FONT, fontSize: 13, color: T.chain }}>{h}/{a} ({pct(h, a)})</span>
    </div>
  );
}

function ThrowBreakdown({ lang, throwLog }) {
  const { hand, dist } = computeBreakdowns(throwLog);
  const s = STRINGS[lang];
  const handRows = [
    [s.statForehand, hand.forehand],
    [s.statBackhand, hand.backhand],
    [s.tagWeakHand, hand.weak],
  ].filter(([, v]) => v.a > 0);
  const distRows = dist.filter((b) => b.a > 0);

  if (!handRows.length && !distRows.length) {
    return <div style={{ fontSize: 12, color: T.inkDim, textAlign: "center" }}>{s.noThrowsLogged}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {handRows.length > 0 && (
        <div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 10, color: T.inkDim, textTransform: "uppercase", marginBottom: 6 }}>{s.statsBreakdownHand}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {handRows.map(([label, v]) => <BreakdownRow key={label} label={label} a={v.a} h={v.h} />)}
          </div>
        </div>
      )}
      {distRows.length > 0 && (
        <div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 10, color: T.inkDim, textTransform: "uppercase", marginBottom: 6 }}>{s.statsBreakdownDistance}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {distRows.map((b) => <BreakdownRow key={b.label} label={b.label} a={b.a} h={b.h} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function computeAwards(lang, players) {
  const withTotals = players.map((p) => {
    const totalAttempts = p.stats.puttAttempts + p.stats.approachAttempts;
    const totalMakes = p.stats.puttMakes + p.stats.approachMakes;
    return { ...p, totalAttempts, totalMakes, hitRate: totalAttempts ? totalMakes / totalAttempts : -1 };
  });

  const byMax = (key) => withTotals.reduce((best, p) => (p[key] > (best ? best[key] : -Infinity) ? p : best), null);

  const hero = byMax("hitRate");
  const longestPutt = withTotals.reduce((best, p) => (p.stats.longestPutt > (best ? best.stats.longestPutt : -1) ? p : best), null);
  const mostForehand = withTotals.reduce((best, p) => (p.stats.forehandMakes > (best ? best.stats.forehandMakes : -1) ? p : best), null);
  const mostPerks = withTotals.reduce((best, p) => (p.stats.perksCount > (best ? best.stats.perksCount : -1) ? p : best), null);
  const comeback = withTotals.reduce((best, p) => ((p.worstDeficit || 0) < (best ? (best.worstDeficit || 0) : 1) ? p : best), null);

  const cards = [];
  if (hero && hero.totalAttempts > 0) cards.push([t(lang, "awardsHero"), hero.name, `${Math.round(hero.hitRate * 100)}%`]);
  if (longestPutt && longestPutt.stats.longestPutt > 0) cards.push([STRINGS[lang].statLongestPutt, longestPutt.name, `${longestPutt.stats.longestPutt}m`]);
  if (mostForehand && mostForehand.stats.forehandMakes > 0) cards.push([t(lang, "awardsMostForehand"), mostForehand.name, `${mostForehand.stats.forehandMakes}`]);
  if (mostPerks && mostPerks.stats.perksCount > 0) cards.push([t(lang, "awardsMostPerks"), mostPerks.name, `${mostPerks.stats.perksCount}`]);
  if (comeback && (comeback.worstDeficit || 0) < 0) cards.push([t(lang, "awardsComeback"), comeback.name, `${comeback.worstDeficit}`]);
  return cards;
}

function ResultsScreen({ lang, players, winnerIdx, onReplay }) {
  const [showStats, setShowStats] = useState(false);
  const ranked = useMemo(
    () => players.map((p, i) => ({ ...p, i })).sort((a, b) => b.score - a.score),
    [players]
  );
  const medals = ["🥇", "🥈", "🥉"];
  const awards = useMemo(() => computeAwards(lang, players), [lang, players]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Podium first — names only, big and simple */}
      <div style={{ textAlign: "center", padding: "16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {ranked.slice(0, 3).map((p, i) => (
          <div key={p.i} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ fontSize: i === 0 ? 34 : 24 }}>{medals[i]}</span>
            <span style={{ fontFamily: DISPLAY_FONT, fontSize: i === 0 ? 34 : 22, color: i === 0 ? T.accent : T.ink }}>{p.name}</span>
          </div>
        ))}
      </div>

      {/* Then: fun award categories, not raw stats */}
      {awards.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {awards.map(([label, name, val]) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: T.surface, border: `1px solid ${T.surfaceLine}`, borderRadius: 12, padding: "10px 14px",
            }}>
              <div>
                <div style={{ fontFamily: MONO_FONT, fontSize: 10, color: T.inkDim, textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontSize: 16 }}>{name}</div>
              </div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 14, color: T.accent }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setShowStats((v) => !v)} style={{
        background: "none", border: `1px solid ${T.surfaceLine}`, borderRadius: 10,
        color: T.inkDim, padding: "10px", cursor: "pointer", fontFamily: BODY_FONT, fontSize: 12,
      }}>
        {showStats ? t(lang, "hideStats") : t(lang, "showStats")}
      </button>

      {showStats && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ranked.map((p, rank) => {
            const totalAttempts = p.stats.puttAttempts + p.stats.approachAttempts;
            const totalMakes = p.stats.puttMakes + p.stats.approachMakes;
            const items = [
              [STRINGS[lang].statHit, pct(totalMakes, totalAttempts)],
              [STRINGS[lang].statPutt, pct(p.stats.puttMakes, p.stats.puttAttempts)],
              [STRINGS[lang].statApproach, pct(p.stats.approachMakes, p.stats.approachAttempts)],
              [STRINGS[lang].statForehand, pct(p.stats.forehandMakes, p.stats.forehand)],
              [STRINGS[lang].statBackhand, pct(p.stats.backhandMakes, p.stats.backhand)],
              [STRINGS[lang].statLongestPutt, p.stats.longestPutt ? `${p.stats.longestPutt}m` : "–"],
            ];
            return (
              <div key={p.i} style={{
                background: T.surface, border: `1px solid ${p.i === winnerIdx ? T.accent : T.surfaceLine}`,
                borderRadius: 14, padding: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: MONO_FONT, color: T.inkDim, fontSize: 13 }}>#{rank + 1}</span>
                    <span style={{ fontFamily: DISPLAY_FONT, fontSize: 18 }}>{p.name}</span>
                  </div>
                  <span style={{ fontFamily: DISPLAY_FONT, fontSize: 20, color: T.accent }}>{p.score}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, fontFamily: MONO_FONT }}>
                  {items.map(([label, val]) => (
                    <div key={label} style={{ background: T.bg2, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 15, color: T.chain }}>{val}</div>
                      <div style={{ fontSize: 9, color: T.inkDim, marginTop: 2, textTransform: "uppercase" }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <ThrowBreakdown lang={lang} throwLog={p.throwLog} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={onReplay} style={{
        padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
        background: T.accent, color: T.accentInk, fontFamily: DISPLAY_FONT, fontSize: 16,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <Target size={18} /> {t(lang, "playAgain")}
      </button>
    </div>
  );
}
