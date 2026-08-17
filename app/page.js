"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { LOGO_DATA_URI, T, DISPLAY_FONT, MONO_FONT, BODY_FONT, LANGUAGES, LANG_LABEL, PRIVACY_FILES, detectLanguage, STRINGS } from "../lib/shared";

export default function Home() {
  const [user, setUser] = useState(undefined); // undefined = laddar, null = utloggad
  const [language, setLanguage] = useState(detectLanguage);

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

  const s = STRINGS[language];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 30, letterSpacing: 0.5, color: T.ink }}>
          PUTT <span style={{ color: T.accent }}>BATTLE</span>
        </div>
        <div style={{ fontFamily: MONO_FONT, fontSize: 12, color: T.inkDim, marginTop: 4 }}>
          TRÄNA · TÄVLA · SKRATTA · UPPREPA
        </div>
      </div>

      <img
        src={LOGO_DATA_URI}
        alt="Putt Battle"
        style={{ width: 220, height: 220, objectFit: "contain" }}
      />

      {user === undefined && <div style={{ opacity: 0.6, fontFamily: BODY_FONT }}>Laddar…</div>}

      {user === null && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
          <div style={{ textAlign: "center", fontSize: 13, opacity: 0.8, lineHeight: 1.5, fontFamily: BODY_FONT }}>
            Logga in för att spela. Har du inget konto än skapas ett automatiskt när du loggar in första gången.
          </div>
          <Link href="/login" style={btnPrimary}>
            Logga in / Skapa konto
          </Link>
        </div>
      )}

      {user && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
          <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "#111", lineHeight: 1.5, fontFamily: BODY_FONT }}>
            Inloggad som {user.email}
          </div>
          <Link href="/friends" style={btnPrimary}>
            Spela med vänner
          </Link>
          <Link href="/solo" style={btnPrimary}>
            Spela Solo
          </Link>
          <button onClick={signOut} style={btnGreenDark}>
            Logga ut
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        {LANGUAGES.map((code) => (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            style={{
              padding: "4px 10px", borderRadius: 999, cursor: "pointer",
              border: language === code ? `1px solid ${T.accent}` : `1px solid ${T.surfaceLine}`,
              background: language === code ? T.accent : "transparent",
              color: language === code ? T.accentInk : T.inkDim,
              fontFamily: BODY_FONT, fontWeight: 600, fontSize: 11,
            }}
          >
            {LANG_LABEL[code]}
          </button>
        ))}
      </div>

      <a
        href={PRIVACY_FILES[language] || PRIVACY_FILES.swe}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 12, color: "#999", textDecoration: "underline", marginTop: 0 }}
      >
        {s.privacyPolicyLabel}
      </a>
    </div>
  );
}

const btnPrimary = {
  display: "block",
  textAlign: "center",
  padding: "16px",
  borderRadius: 12,
  background: T.accent,
  color: T.accentInk,
  fontWeight: 700,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 16,
  fontFamily: DISPLAY_FONT,
};

const btnGreenDark = {
  display: "block",
  width: "100%",
  textAlign: "center",
  padding: "12px",
  borderRadius: 12,
  background: T.surface,
  color: T.ink,
  fontWeight: 700,
  border: `1px solid ${T.surfaceLine}`,
  cursor: "pointer",
  fontSize: 14,
  fontFamily: DISPLAY_FONT,
};
