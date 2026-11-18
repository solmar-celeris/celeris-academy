"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      const sb = await getSupabase();
      if (!sb) {
        if (live) { setMessage("Não foi possível conectar à Academy."); setReady(true); }
        return;
      }
      const { data: { user } } = await sb.auth.getUser();
      if (live) {
        if (!user) setMessage("O link de redefinição é inválido ou expirou. Solicite um novo link.");
        setReady(true);
      }
    })();
    return () => { live = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (password.length < 8) { setMessage("A senha deve ter pelo menos 8 caracteres."); return; }
    if (password !== confirm) { setMessage("As senhas não coincidem."); return; }
    setBusy(true);
    const sb = await getSupabase();
    if (!sb) { setBusy(false); setMessage("Não foi possível conectar à Academy."); return; }
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) { setMessage(error.message); return; }
    setMessage("Senha atualizada com sucesso. Você já pode entrar.");
    window.setTimeout(() => router.replace("/login"), 1200);
  }

  return (
    <main className="auth-shell">
      <a className="brand auth-brand" href="/"><img className="brand-logo" src="/solmar-celeris-logo.png" alt="SolMar Celeris" /><span className="brand-copy"><strong>SOLMAR CELERIS</strong><small>ACADEMY</small></span></a>
      <section className="auth-card">
        <div className="eyebrow"><span /> SEGURANÇA DA CONTA</div>
        <h1 className="auth-title">Nova<br /><em>senha.</em></h1>
        <p className="auth-description">Defina uma nova senha para acessar a Celeris Academy.</p>
        {ready && !message.startsWith("O link") && (
          <form className="auth-form" onSubmit={submit}>
            <label htmlFor="new-password">Nova senha</label>
            <input id="new-password" type="password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" />
            <label htmlFor="confirm-password">Confirmar senha</label>
            <input id="confirm-password" type="password" minLength={8} required value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="Digite novamente" />
            <button className="primary-button auth-submit" disabled={busy}>{busy ? "Salvando..." : "Salvar nova senha"} <span>→</span></button>
          </form>
        )}
        {message && <p className="auth-message" role="status">{message}</p>}
        <Link className="back-link" href="/login">← Voltar ao login</Link>
      </section>
    </main>
  );
}
