const learningAreas = [
  { number: "01", title: "Cursos e trilhas", description: "Conteúdos organizados por competências, módulos e aulas.", symbol: "↗" },
  { number: "02", title: "Aulas ao vivo", description: "Encontros, workshops e sessões de aprendizagem em tempo real.", symbol: "◉" },
  { number: "03", title: "Avaliações", description: "Atividades, questionários, provas e acompanhamento de resultados.", symbol: "✓" },
  { number: "04", title: "Certificados", description: "Histórico de conquistas e certificações da jornada Celeris.", symbol: "✳" },
];

export default function Home() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="SolMar Celeris Academy início">
          <img className="brand-logo" src="/solmar-celeris-logo.png" alt="Símbolo SolMar Celeris" />
          <span className="brand-copy"><strong>SOLMAR CELERIS</strong><small>ACADEMY</small></span>
        </a>
        <span className="topbar-label">UNIVERSIDADE CORPORATIVA</span>
        <a className="access-link" href="#acesso">Acesso institucional <span>↗</span></a>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> APRENDER · EVOLUIR · REALIZAR</div>
          <h1>Conhecimento que<br /><em>move</em> a Celeris.</h1>
          <p className="hero-description">Um espaço de desenvolvimento contínuo para compartilhar conhecimento, fortalecer competências e preparar as próximas conquistas da SolMar Celeris.</p>
          <a className="primary-button" href="#acesso">Entrar na plataforma <span>→</span></a>
          <div className="hero-footnote">AMBIENTE EXCLUSIVO PARA MEMBROS DA SOLMAR CELERIS</div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
          <div className="core"><img src="/solmar-mark.svg" alt="" /></div>
          <div className="art-caption"><b>01 / 04</b><span>APRENDIZAGEM CONTÍNUA</span></div>
        </div>
      </section>
      <section className="areas" aria-labelledby="areas-title">
        <div className="section-heading">
          <div><div className="eyebrow">SUA JORNADA COMEÇA AQUI</div><h2 id="areas-title">Um universo de possibilidades.</h2></div>
          <p>Ferramentas para transformar aprendizado em capacidade de fazer.</p>
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
      <section className="access-panel" id="acesso">
        <div><div className="eyebrow">PORTAL INTERNO</div><h2>Seu próximo passo começa com conhecimento.</h2><p>O acesso institucional será habilitado após a configuração do ambiente seguro da Academia.</p></div>
        <span className="setup-status"><i /> AMBIENTE EM CONFIGURAÇÃO</span>
      </section>
      <footer className="footer"><span>© {new Date().getFullYear()} SOLMAR CELERIS</span><span>CELERIS ACADEMY · CONHECIMENTO EM MOVIMENTO</span></footer>
    </main>
  );
}
