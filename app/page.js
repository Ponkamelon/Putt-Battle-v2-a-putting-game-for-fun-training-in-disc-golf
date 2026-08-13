"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState(undefined); // undefined = laddar, null = utloggad

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 30, textAlign: "center" }}>
        PUTT <span style={{ color: "#7CE38B" }}>BATTLE</span>
      </div>

      {user === undefined && <div style={{ textAlign: "center", opacity: 0.6 }}>Laddar…</div>}

      {user === null && (
        <>
          <div style={{ textAlign: "center", fontSize: 13, opacity: 0.8 }}>
            Logga in för att spara din Solo-statistik permanent.
          </div>
          <Link href="/login" style={btnPrimary}>
            Logga in
          </Link>
        </>
      )}

      {user && (
        <>
          <div style={{ textAlign: "center", fontSize: 13, opacity: 0.8 }}>
            Inloggad som {user.email}
          </div>
          <Link href="/solo" style={btnPrimary}>
            Spela Solo
          </Link>
          <button onClick={signOut} style={btnGhost}>
            Logga ut
          </button>
        </>
      )}
    </div>
  );
}

const btnPrimary = {
  display: "block",
  textAlign: "center",
  padding: "16px",
  borderRadius: 12,
  background: "#7CE38B",
  color: "#0E2417",
  fontWeight: 700,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 16,
};

const btnGhost = {
  padding: "12px",
  borderRadius: 12,
  background: "transparent",
  color: "#EAF3EC",
  border: "1px solid #2A4A3A",
  cursor: "pointer",
  fontSize: 14,
};
