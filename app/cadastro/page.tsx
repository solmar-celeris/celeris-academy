"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (password.length < 8) { setMessage("A senha precisa ter pelo menos 8 caracteres."); return; }
    if (password !== confirmation) { setMessage("As senhas não coincidem."); return; }

    setBusy(true);
    const supabase = await getSupabase();
    if (!supabase) {
      setBusy(false);
      setMessage("Não foi possível conectar à Academy. Tente novamente em instantes.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    setBusy(false);
    if (error) {
      setMessage(error.message === "User already registered"
        ? "Não foi possível concluir o cadastro com esse e-mail. Tente entrar ou recuperar sua senha."
        : "Não foi possível concluir o cadastro. Confira os dados e tente novamente.");
      return;
    }

    if (data.session) {
      router.replace("/portal");
      return;
    }

    setCreated(true);
    setMessage("Cadastro iniciado! Se a confirmação de e-mail estiver ativada, acesse sua caixa de entrada e confirme o endereço para entrar na Academy.");
  }

  return (
    <main className="auth-shell">
      <a className="brand auth-brand" href="/"><img className="brand-logo" src="/solmar-celeris-logo.png" alt="Símbolo SolMar Celeris" /><span className="brand-copy"><strong>SOLMAR CELERIS</strong><small>ACADEMY</small></span></a>
      <section className="auth-card signup-card">
        <div className="eyebrow"><span /> FAÇA PARTE DA ACADEMY</div>
        <h1 className="auth-title">Crie sua<br /><em>conta.</em></h1>
        <p className="auth-description">Cadastre-se diretamente para começar sua jornada de aprendizagem na SolMar Celeris.</p>
        <div className="auth-tabs" aria-label="Acesso à plataforma">
          <Link href="/login">Entrar</Link>
          <span aria-current="page">Criar conta</span>
        </div>
        {!created ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="full-name">Nome completo</label>
            <input id="full-name" type="text" autoComplete="name" required maxLength={120} value={fullName} onChange={event => setFullName(event.target.value)} placeholder="Como podemos chamar você?"/>
            <label htmlFor="signup-email">E-mail</label>
            <input id="signup-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="seuemail@exemplo.com"/>
            <label htmlFor="signup-password">Criar senha</label>
            <input id="signup-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres"/>
            <label htmlFor="signup-confirmation">Confirmar senha</label>
            <input id="signup-confirmation" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="Digite a senha novamente"/>
            <button className="primary-button auth-submit" type="submit" disabled={busy}>{busy ? "Criando conta..." : "Criar minha conta"} <span>→</span></button>
          </form>
        ) : (
          <div className="signup-success">
            <div className="signup-success-icon">✓</div>
            <strong>Cadastro realizado</strong>
            <p>Seu perfil é criado como aluno. Não é necessária aprovação de tutor para se cadastrar.</p>
            <Link className="primary-button auth-submit" href="/login">Ir para o login <span>→</span></Link>
          </div>
        )}
        {message && <p className="auth-message" role="status">{message}</p>}
        <p className="auth-help">Ao criar sua conta, você entra como aluno. O setor de atuação será escolhido na sua área de aprendizagem.</p>
        <Link className="back-link" href="/">← Voltar ao início</Link>
      </section>
      <footer className="auth-footer">© {new Date().getFullYear()} SOLMAR CELERIS · CELERIS ACADEMY</footer>
    </main>
  );
}
