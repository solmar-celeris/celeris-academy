const learningAreas = [
  { number: "01", title: "Cursos e trilhas", description: "Conteúdos organizados por competências, módulos e aulas.", symbol: "↗" },
  { number: "02", title: "Avaliações", description: "Atividades, questionários, provas e acompanhamento de resultados.", symbol: "✓" },
  { number: "03", title: "Certificados", description: "Histórico de conquistas e certificações da jornada Celeris.", symbol: "✳" },
];

export default function Home() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="SolMar Celeris Academy início">
          <img className="brand-logo" src="/solmar-celeris-logo.png" alt="Símbolo SolMar Celeris" />
          <span className="brand-copy"><strong>SOLMAR CELERIS</strong><small>ACADEMY</small></span>
        </a>
        <a className="access-link" href="/login">Acesso institucional <span>↗</span></a>
      </header>
      <section className="hero">
        <div className="hero-layout">
        <div className="hero-copy">
          <div className="eyebrow"><span /> APRENDER · EVOLUIR · REALIZAR</div>
          <h1>Navegando no<br /><em>conhecimento.</em></h1>
          <p className="hero-description">Um espaço de desenvolvimento contínuo para compartilhar conhecimento, fortalecer competências e preparar as próximas conquistas da SolMar Celeris.</p>
          <div className="hero-actions"><a className="primary-button" href="/login">Entrar na plataforma <span>→</span></a><a className="secondary-button" href="/cadastro">Criar minha conta <span>↗</span></a></div>
        </div>
        <div className="hero-photo"><img src="/solmar-celeris-team-hero.jpg" alt="Equipe SolMar Celeris trabalhando nos barcos durante uma atividade náutica" /></div>
        </div>
      </section>
      <section className="areas" aria-labelledby="areas-title">
        <div className="section-heading">
          <div><div className="eyebrow">SUA JORNADA COMEÇA AQUI</div><h2 id="areas-title">Um universo de possibilidades.</h2></div>
        </div>
        <div className="area-grid">
          {learningAreas.map((area) => (
            <article className="area-card" key={area.number}>
              <div className="area-top"><span>{area.number}</span><b>{area.symbol}</b></div>
              <h3>{area.title}</h3><p>{area.description}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="footer"><span>© {new Date().getFullYear()} SOLMAR CELERIS</span></footer>
    </main>
  );
}
