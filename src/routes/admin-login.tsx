import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Admin · Mileyn Events" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "mileyn" && password === "1234") {
      sessionStorage.setItem("mileyn_admin", "1");
      navigate({ to: "/admin" });
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border rounded-2xl p-8 shadow-soft" style={{ boxShadow: "var(--shadow-soft)" }}>
        <h1 className="text-2xl font-display font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>Admin Sign In</h1>
        <p className="text-sm text-ink-soft mb-6">Mileyn Events Dashboard</p>
        {error && <div className="mb-4 text-sm text-destructive">{error}</div>}
        <label className="block mb-3">
          <span className="block text-xs uppercase tracking-wider mb-1.5 text-ink-soft">Username</span>
          <input autoFocus value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 bg-background outline-none focus:border-primary" />
        </label>
        <label className="block mb-5">
          <span className="block text-xs uppercase tracking-wider mb-1.5 text-ink-soft">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 bg-background outline-none focus:border-primary" />
        </label>
        <button type="submit" className="w-full py-3 rounded-full text-primary-foreground font-medium" style={{ background: "var(--gradient-brand)" }}>
          Sign In
        </button>
      </form>
    </div>
  );
}
