# Arquitetura — Celeris Academy

## Propósito

Universidade corporativa privada da SolMar Celeris. Não é marketplace nem SaaS para escolas externas. O acesso será restrito aos membros autorizados da organização.

## Perfis institucionais

- **Administrador:** gerencia membros, instrutores, cursos, configurações e relatórios.
- **Instrutor:** cria e administra cursos, módulos, aulas e avaliações; acompanha os alunos.
- **Aluno:** acessa cursos atribuídos, acompanha o progresso, realiza avaliações e consulta certificados.

As permissões deverão ser verificadas no servidor e reforçadas por políticas RLS no banco. Metadados editáveis pelo próprio usuário não podem conceder privilégios.

## Módulos previstos

1. **Cursos e trilhas:** catálogo interno, módulos, aulas, materiais e progresso.
2. **Avaliações:** questionários, provas, tarefas, submissões e revisão pelo instrutor.
3. **Certificados:** emissão após cumprimento dos critérios, com identificador e verificação.
4. **Aulas ao vivo:** salas via LiveKit; tokens gerados no servidor.
5. **Tutor de IA:** apoio contextual às aulas, com provedor configurável e chaves somente no servidor.
6. **Administração:** membros, matrículas, instrutores, relatórios e parâmetros institucionais.

## Infraestrutura

- Aplicação: Next.js no Cloudflare Workers via OpenNext.
- Dados e autenticação: projeto Supabase independente, ainda a provisionar.
- Arquivos: buckets privados no Supabase Storage, protegidos por RLS.
- Reuniões: LiveKit Cloud ou infraestrutura própria, decisão posterior.
- IA: provedor a definir; segredos nunca enviados ao navegador.

## Regras de isolamento

O Academy deve possuir projeto Supabase, credenciais, storage, domínio e configuração próprios. Não compartilhar banco, chaves ou tabelas com Team Celeris ou Celeris Store.

## Sequência de implementação

1. Validar build e execução no Cloudflare Workers.
2. Criar o projeto Supabase exclusivo e configurar variáveis.
3. Implementar autenticação institucional e convites.
4. Modelar cursos, matrículas, módulos, aulas e progresso com RLS.
5. Implementar avaliações e certificados.
6. Integrar LiveKit.
7. Integrar tutor de IA e ferramentas administrativas.
8. Adicionar testes de autorização, fluxos e experiência mobile.

## Segurança

- Nunca versionar .env.local, .dev.vars ou credenciais.
- Nunca expor SUPABASE_SERVICE_ROLE_KEY, chaves de IA ou segredo LiveKit em variáveis públicas.
- Toda emissão de token de reunião e operação privilegiada deve ocorrer no servidor.
- Migrations devem ser novas, revisadas e aplicadas somente ao projeto Academy.
