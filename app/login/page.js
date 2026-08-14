"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    router.push("/");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Link href="/" style={{ color: "#8FAFA0", fontSize: 13, textDecoration: "none" }}>
        ← Startsida
      </Link>

      <div style={{ fontFamily: "Georgia, serif", fontSize: 24 }}>
        {mode === "signin" ? "Logga in" : "Skapa konto"}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => { setMode("signin"); setStatus("idle"); setErrorMsg(""); }}
          style={tabStyle(mode === "signin")}
        >
          Logga in
        </button>
        <button
          type="button"
          onClick={() => { setMode("signup"); setStatus("idle"); setErrorMsg(""); }}
          style={tabStyle(mode === "signup")}
        >
          Skapa konto
        </button>
      </div>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email"
          required
          placeholder="din@epost.se"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <button
          type="submit"
          disabled={status === "loading"}
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
          {status === "loading"
            ? "Skickar…"
            : mode === "signin"
            ? "Logga in"
            : "Skapa konto"}
        </button>
        {status === "error" && (
          <div style={{ color: "#FF9F5A", fontSize: 13 }}>{errorMsg}</div>
        )}
      </form>
    </div>
  );
}

function tabStyle(active) {
  return {
    flex: 1,
    padding: "10px",
    borderRadius: 10,
    border: active ? "1px solid #7CE38B" : "1px solid #2A4A3A",
    background: active ? "#7CE38B" : "transparent",
    color: active ? "#0E2417" : "#EAF3EC",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  };
}

const inputStyle = {
  padding: 12,
  borderRadius: 8,
  border: "1px solid #2A4A3A",
  background: "#12301F",
  color: "#EAF3EC",
  fontSize: 14,
};
