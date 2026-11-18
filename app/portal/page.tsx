"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function PortalPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    if (!supabase) {
      router.replace("/login");
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) router.replace("/login");
      else {
        setEmail(data.user.email ?? "");
        setChecking(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
      else setEmail(session.user.email ?? "");
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  async function signOut() {
    await supabase?.auth.signOut();
    router.replace("/");
  }

  if (checking) return <main className="auth-shell"><p className="auth-description">Verificando seu acesso...</p></main>;

  return (
    <main className="auth-shell">
      <section className="auth-card portal-card">
        <div className="eyebrow"><span /> ACESSO CONFIRMADO</div>
        <h1 className="auth-title">Olá,<br /><em>bem-vindo.</em></h1>
        <p className="auth-description">Você entrou na Celeris Academy com a conta {email}.</p>
        <p className="portal-notice">Seu ambiente de aprendizagem está sendo preparado. Os cursos e conteúdos aparecerão aqui assim que forem publicados.</p>
        <button className="primary-button auth-submit" onClick={signOut}>Sair da conta <span>↗</span></button>
      </section>
    </main>
  );
}
