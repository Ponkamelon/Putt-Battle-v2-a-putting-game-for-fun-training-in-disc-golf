export const metadata = {
  title: "Putt Battle",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <body
        style={{
          background: "#0E2417",
          color: "#EAF3EC",
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          minHeight: "100vh",
        }}
      >
        <div style={{ maxWidth: 440, margin: "0 auto", padding: 20 }}>{children}</div>
      </body>
    </html>
  );
}
