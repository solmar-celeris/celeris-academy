"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!supabase) {
      setMessage("A conexão com o Supabase não foi configurada no Worker. Confira as variáveis públicas.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setMessage("Não foi possível entrar. Confira seu e-mail e senha ou solicite a liberação do seu acesso.");
      return;
    }
    router.replace("/portal");
  }

  async function handleRecovery() {
    setMessage("");
    if (!supabase) {
      setMessage("A conexão com o Supabase não foi configurada.");
      return;
    }
    if (!email.trim()) {
      setMessage("Informe seu e-mail para receber o link de redefinição.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    setMessage(error ? "Não foi possível enviar o link. Verifique o e-mail informado." : "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.");
  }

  return (
    <main className="auth-shell">
      <a className="brand auth-brand" href="/">
        <img className="brand-logo" src="/solmar-celeris-logo.png" alt="Símbolo SolMar Celeris" />
        <span className="brand-copy"><strong>SOLMAR CELERIS</strong><small>ACADEMY</small></span>
      </a>
      <section className="auth-card">
        <div className="eyebrow"><span /> ACESSO INSTITUCIONAL</div>
        <h1 className="auth-title">Bem-vindo<br /><em>de volta.</em></h1>
        <p className="auth-description">Entre com seu e-mail institucional e sua senha para acessar a Celeris Academy.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seuemail@solmarceleris.com" />
          <label htmlFor="password">Senha</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite sua senha" />
          <button className="primary-button auth-submit" type="submit" disabled={busy}>{busy ? "Entrando..." : "Entrar na plataforma"} <span>→</span></button>
        </form>
        <button className="text-button" type="button" onClick={handleRecovery}>Esqueci minha senha</button>
        {message && <p className="auth-message" role="status">{message}</p>}
        <div className="auth-divider" />
        <p className="auth-help">Ainda não tem acesso? Solicite a liberação ao administrador da Academy.</p>
        <Link className="back-link" href="/">← Voltar ao início</Link>
      </section>
      <footer className="auth-footer">© {new Date().getFullYear()} SOLMAR CELERIS · CELERIS ACADEMY</footer>
    </main>
  );
}
