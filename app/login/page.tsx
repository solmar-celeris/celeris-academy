"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function destination(supabase: NonNullable<Awaited<ReturnType<typeof getSupabase>>>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "/login";
    const { data: profile, error } = await supabase.from("profiles").select("role,status").eq("id", user.id).maybeSingle();
    if (error || !profile || profile.status !== "active") {
      await supabase.auth.signOut();
      setMessage("Seu perfil ainda não está liberado. Solicite apoio ao administrador.");
      return null;
    }
    return profile.role === "admin" ? "/admin" : "/portal";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setBusy(true);
    const supabase = await getSupabase();
    if (!supabase) { setBusy(false); setMessage("O Worker não disponibilizou as variáveis públicas do Supabase. Confira as configurações e o deploy."); return; }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setBusy(false); setMessage("Não foi possível entrar. Confira seu e-mail e senha ou solicite a liberação do seu acesso."); return; }
    const path = await destination(supabase);
    setBusy(false);
    if (path) router.replace(path);
  }

  async function handleRecovery() {
    setMessage("");
    if (!email.trim()) { setMessage("Informe seu e-mail para receber o link de redefinição."); return; }
    setBusy(true);
    const supabase = await getSupabase();
    if (!supabase) { setBusy(false); setMessage("O Worker não disponibilizou as variáveis públicas do Supabase."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/update-password` });
    setBusy(false);
    setMessage(error ? "Não foi possível enviar o link. Verifique as configurações de e-mail da Academy." : "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.");
  }

  return (
    <main className="auth-shell">
      <a className="brand auth-brand" href="/"><img className="brand-logo" src="/solmar-celeris-logo.png" alt="Símbolo SolMar Celeris" /><span className="brand-copy"><strong>SOLMAR CELERIS</strong><small>ACADEMY</small></span></a>
      <section className="auth-card">
        <div className="eyebrow"><span /> ACESSO INSTITUCIONAL</div>
        <div className="auth-tabs" aria-label="Acesso à plataforma"><span aria-current="page">Entrar</span><Link href="/cadastro">Criar conta</Link></div>
        <h1 className="auth-title">Bem-vindo<br /><em>de volta.</em></h1>
        <p className="auth-description">Entre com seu e-mail institucional e sua senha para acessar a Celeris Academy.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label><input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="seuemail@solmarceleris.com" />
          <label htmlFor="password">Senha</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Digite sua senha" />
          <button className="primary-button auth-submit" type="submit" disabled={busy}>{busy ? "Entrando..." : "Entrar na plataforma"} <span>→</span></button>
        </form>
        <button className="text-button" type="button" onClick={handleRecovery} disabled={busy}>Esqueci minha senha</button>
        {message && <p className="auth-message" role="status">{message}</p>}
        <div className="auth-divider" /><p className="auth-help">O cadastro é livre e cria automaticamente uma conta de aluno.</p><Link className="back-link" href="/">← Voltar ao início</Link>
      </section>
      <footer className="auth-footer">© {new Date().getFullYear()} SOLMAR CELERIS · CELERIS ACADEMY</footer>
    </main>
  );
}
