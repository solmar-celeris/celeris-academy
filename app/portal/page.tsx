"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export default function PortalPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    async function checkSession() {
      const supabase = await getSupabase();
      if (!active) return;
      if (!supabase) {
        router.replace("/login");
        return;
      }
      setClient(supabase);
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) router.replace("/login");
      else {
        setEmail(data.user.email ?? "");
        setChecking(false);
      }
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) router.replace("/login");
        else setEmail(session.user.email ?? "");
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    }

    void checkSession();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  async function signOut() {
    await client?.auth.signOut();
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
