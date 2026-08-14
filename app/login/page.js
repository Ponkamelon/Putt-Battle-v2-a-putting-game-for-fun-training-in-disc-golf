"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  const sendLink = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Link href="/" style={{ color: "#8FAFA0", fontSize: 13, textDecoration: "none" }}>
        ← Startsida
      </Link>

      <div style={{ fontFamily: "Georgia, serif", fontSize: 24 }}>Logga in</div>
      <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.5 }}>
        Inget konto än? Inga problem — samma formulär skapar automatiskt ett konto åt dig första gången du loggar in.
      </div>

      {status === "sent" ? (
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          Vi har skickat en inloggningslänk till <b>{email}</b>. Öppna den på den här enheten för
          att logga in.
        </div>
      ) : (
        <form onSubmit={sendLink} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            required
            placeholder="din@epost.se"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid #2A4A3A",
              background: "#12301F",
              color: "#EAF3EC",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              padding: 14,
              borderRadius: 12,
              background: "#7CE38B",
              color: "#0E2417",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            {status === "sending" ? "Skickar…" : "Skicka inloggningslänk"}
          </button>
          {status === "error" && (
            <div style={{ color: "#FF9F5A", fontSize: 13 }}>{errorMsg}</div>
          )}
        </form>
      )}
    </div>
  );
}
