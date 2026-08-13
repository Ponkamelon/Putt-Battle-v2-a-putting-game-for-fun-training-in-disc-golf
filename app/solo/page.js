"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { DIFFICULTIES, MIN_DISTANCE, scoreFor, depthStepSize, buildTurn } from "../../lib/gameLogic";

const HAND_LABEL = { forehand: "Forehand", backhand: "Backhand" };

export default function SoloPage() {
  const [user, setUser] = useState(undefined);
  const [screen, setScreen] = useState("setup"); // setup | play | results
  const [difficulty, setDifficulty] = useState("amateur");
  const [winScore, setWinScore] = useState(15);
  const [maxDistance, setMaxDistance] = useState(25);

  const [player, setPlayer] = useState(null);
  const [turn, setTurn] = useState(null);
  const [saving, setSaving] = useState(false);
  const [allTime, setAllTime] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
  }, []);

  if (user === undefined) return <div style={{ opacity: 0.6 }}>Laddar…</div>;
  if (user === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 14 }}>Du måste logga in för att spela Solo och spara statistik.</div>
        <Link href="/login" style={{ color: "#7CE38B" }}>
          → Logga in
        </Link>
      </div>
    );
  }

  const diff = DIFFICULTIES[difficulty];

  const startSession = () => {
    const initial = {
      distance: diff.start,
      score: 0,
      streak: 0,
      bestStreak: 0,
      highestDistance: diff.start,
      throwLog: [],
    };
    setPlayer(initial);
    setTurn(buildTurn(initial.distance, diff));
    setScreen("play");
    setAllTime(null);
  };

  const applyResult = async (hit) => {
    const done = turn.throwsDone + 1;
    const hits = turn.throwHits + (hit ? 1 : 0);
    const finished = done >= turn.throwsNeeded;

    // Logga alltid det enskilda kastet.
    const throwEntry = { hand: turn.hand, weakHand: turn.weakHand, distance: turn.distance, hit };
    const nextLog = [...player.throwLog, throwEntry];

    if (!finished) {
      setPlayer({ ...player, throwLog: nextLog });
      setTurn({ ...turn, throwsDone: done, throwHits: hits });
      return;
    }

    const allHit = hits === turn.throwsNeeded;
    let { distance, score, streak, bestStreak, highestDistance } = player;

    if (allHit) {
      score += turn.points + (turn.knee ? 1 : 0);
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }

    const stepSize = depthStepSize(turn.distance);
    distance = allHit
      ? Math.min(maxDistance, turn.distance + stepSize)
      : Math.max(MIN_DISTANCE, turn.distance - stepSize);
    highestDistance = Math.max(highestDistance, distance);

    const updatedPlayer = { distance, score, streak, bestStreak, highestDistance, throwLog: nextLog };
    setPlayer(updatedPlayer);

    if (score >= winScore) {
      await finishSession(updatedPlayer);
      return;
    }

    setTurn(buildTurn(distance, diff));
  };

  const finishSession = async (finalPlayer) => {
    setSaving(true);
    try {
      const { data: session, error: sessionError } = await supabase
        .from("solo_sessions")
        .insert({
          user_id: user.id,
          difficulty,
          final_score: finalPlayer.score,
          best_streak: finalPlayer.bestStreak,
          highest_distance: finalPlayer.highestDistance,
        })
        .select()
        .single();
      if (sessionError) throw sessionError;

      if (finalPlayer.throwLog.length > 0) {
        const rows = finalPlayer.throwLog.map((t) => ({
          session_id: session.id,
          hand: t.hand,
          weak_hand: t.weakHand,
          distance: t.distance,
          hit: t.hit,
        }));
        const { error: throwsError } = await supabase.from("solo_throws").insert(rows);
        if (throwsError) throw throwsError;
      }

      const { data: stats, error: statsError } = await supabase.rpc("get_alltime_stats");
      if (statsError) throw statsError;
      setAllTime(stats?.[0] || null);
    } catch (err) {
      console.error(err);
      alert("Kunde inte spara sessionen: " + err.message);
    } finally {
      setSaving(false);
      setScreen("results");
    }
  };

  if (screen === "setup") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Link href="/" style={{ color: "#8FAFA0", fontSize: 13, textDecoration: "none" }}>
          ← Startsida
        </Link>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 24 }}>Play Solo</div>

        <Section title="Svårighetsgrad">
          {Object.keys(DIFFICULTIES).map((k) => (
            <Pill key={k} active={difficulty === k} onClick={() => setDifficulty(k)}>
              {k}
            </Pill>
          ))}
        </Section>

        <Section title="Målpoäng">
          {[10, 15, 20, 30].map((v) => (
            <Pill key={v} active={winScore === v} onClick={() => setWinScore(v)}>
              {v}
            </Pill>
          ))}
        </Section>

        <Section title="Maxavstånd">
          {[20, 25, 30].map((v) => (
            <Pill key={v} active={maxDistance === v} onClick={() => setMaxDistance(v)}>
              {v} m
            </Pill>
          ))}
        </Section>

        <button onClick={startSession} style={btnPrimary}>
          Starta match →
        </button>
      </div>
    );
  }

  if (screen === "play" && turn && player) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, opacity: 0.6 }}>POÄNG</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 40, color: "#7CE38B" }}>{player.score}</div>
        </div>

        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 26 }}>{HAND_LABEL[turn.hand]}!</div>
          <div style={{ fontSize: 15, opacity: 0.8, marginTop: 4 }}>
            {turn.distance}m {turn.knee ? "· KNÄ I MARKEN" : ""} {turn.weakHand ? "· SVAG HAND" : ""}
          </div>
          {turn.kind === "approach" && (
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
              Approach {turn.throwsDone + 1}/{turn.throwsNeeded}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => applyResult(false)} style={btnMiss}>
            ✕ Miss
          </button>
          <button onClick={() => applyResult(true)} style={btnHit}>
            ✓ Satt
          </button>
        </div>
      </div>
    );
  }

  if (screen === "results") {
    const handRows = [
      ["Forehand", player.throwLog.filter((t) => !t.weakHand && t.hand === "forehand")],
      ["Backhand", player.throwLog.filter((t) => !t.weakHand && t.hand === "backhand")],
      ["Svag hand", player.throwLog.filter((t) => t.weakHand)],
    ].filter(([, arr]) => arr.length > 0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ fontSize: 12, opacity: 0.6 }}>SLUTPOÄNG</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 48, color: "#7CE38B" }}>{player.score}</div>
        </div>

        {saving && <div style={{ textAlign: "center", opacity: 0.6 }}>Sparar…</div>}

        {handRows.length > 0 && (
          <Section title="Den här sessionen">
            {handRows.map(([label, arr]) => {
              const hits = arr.filter((t) => t.hit).length;
              return (
                <Row key={label} label={label} value={`${hits}/${arr.length} (${Math.round((hits / arr.length) * 100)}%)`} />
              );
            })}
          </Section>
        )}

        {allTime && (
          <Section title="All-time (alla sessioner)">
            <Row label="Sessioner" value={String(allTime.total_sessions)} />
            <Row label="Totala poäng" value={String(allTime.total_points)} />
            <Row label="Högsta poäng" value={String(allTime.best_score)} />
            <Row label="Längsta streak" value={String(allTime.best_streak)} />
            <Row label="Högsta avstånd" value={`${allTime.highest_distance}m`} />
            <Row
              label="Träffprocent totalt"
              value={
                allTime.total_throws
                  ? `${Math.round((allTime.total_hits / allTime.total_throws) * 100)}%`
                  : "–"
              }
            />
            {allTime.forehand_attempts > 0 && (
              <Row
                label="Forehand"
                value={`${Math.round((allTime.forehand_hits / allTime.forehand_attempts) * 100)}%`}
              />
            )}
            {allTime.backhand_attempts > 0 && (
              <Row
                label="Backhand"
                value={`${Math.round((allTime.backhand_hits / allTime.backhand_attempts) * 100)}%`}
              />
            )}
            {allTime.weak_hand_attempts > 0 && (
              <Row
                label="Svag hand"
                value={`${Math.round((allTime.weak_hand_hits / allTime.weak_hand_attempts) * 100)}%`}
              />
            )}
          </Section>
        )}

        <button onClick={startSession} style={btnPrimary}>
          Spela igen
        </button>
        <Link href="/" style={btnGhostLink}>
          Till startsidan
        </Link>
      </div>
    );
  }

  return null;
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, opacity: 0.6, textTransform: "uppercase", marginBottom: 6 }}>{title}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 999,
        border: active ? "1px solid #7CE38B" : "1px solid #2A4A3A",
        background: active ? "#7CE38B" : "transparent",
        color: active ? "#0E2417" : "#EAF3EC",
        cursor: "pointer",
        fontSize: 13,
        textTransform: "capitalize",
      }}
    >
      {children}
    </button>
  );
}

function Row({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        background: "#12301F",
        borderRadius: 8,
        padding: "8px 12px",
        width: "100%",
      }}
    >
      <span style={{ fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#7CE38B", fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

const btnPrimary = {
  padding: 16,
  borderRadius: 12,
  background: "#7CE38B",
  color: "#0E2417",
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  fontSize: 16,
};

const btnGhostLink = {
  display: "block",
  textAlign: "center",
  padding: 14,
  borderRadius: 12,
  background: "transparent",
  color: "#EAF3EC",
  border: "1px solid #2A4A3A",
  textDecoration: "none",
  fontSize: 14,
};

const btnHit = {
  flex: 1,
  padding: "22px 0",
  borderRadius: 14,
  border: "none",
  background: "#7CE38B",
  color: "#0E2417",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
};

const btnMiss = {
  flex: 1,
  padding: "22px 0",
  borderRadius: 14,
  border: "2px solid #FF9F5A",
  background: "transparent",
  color: "#FF9F5A",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
};
