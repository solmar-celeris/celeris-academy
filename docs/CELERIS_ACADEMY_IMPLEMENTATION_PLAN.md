# Celeris Academy — Plano de adaptação e implantação

## Objetivo

Transformar esta cópia do LMS em uma universidade interna da SolMar Celeris, exclusiva para capacitação dos membros da equipe.

## Escopo funcional

- Cursos: catálogo interno, módulos, aulas, materiais e acompanhamento de progresso.
- Avaliações: questionários, provas, submissões e revisão pelo instrutor; manter correção assistida por IA onde fizer sentido.
- Certificados: emissão ao concluir os critérios do curso, com código/QR de verificação.
- Aulas ao vivo: integração a implementar com LiveKit; não considerar esse recurso pronto na base original.
- Tutor IA: adaptar o tutor existente para português brasileiro e contexto dos cursos da SolMar Celeris.

## Perfis

- Administrador: gerencia membros, instrutores, cursos, configurações e relatórios.
- Instrutor: cria e administra seus cursos, aulas e avaliações; acompanha alunos.
- Aluno: acessa cursos atribuídos, acompanha progresso, realiza avaliações e consulta certificados.

A autorização deve continuar baseada em dados confiáveis no banco/JWT e em políticas RLS. Não usar metadados editáveis pelo usuário para decisões de autorização.

## Simplificação institucional

A base original é um SaaS multi-tenant com cobrança, pagamentos e recursos para escolas externas. O Celeris Academy será uma única instituição. Antes de remover tabelas ou código, mapear dependências e separar:
1. funcionalidades educacionais que serão mantidas;
2. infraestrutura multi-tenant que pode ser simplificada com segurança;
3. pagamentos, billing e marketplace que devem ser desativados/retirados após auditoria;
4. recursos de plataforma e super-admin que não fazem sentido no produto institucional.

Não remover migrations históricas de forma indiscriminada. Preparar migrations novas, reversíveis e revisadas.

## Infraestrutura isolada

- Repositório: solmar-celeris/celeris-academy
- Supabase: projeto exclusivo do Academy (ainda precisa ser criado/conectado).
- Storage: buckets privados para materiais internos, com políticas RLS.
- IA: configurar provedor e segredos somente no servidor; nunca expor chaves privadas no navegador.
- Ao vivo: LiveKit Cloud ou infraestrutura própria, com tokens gerados no servidor.
- Deploy: validar compatibilidade do Next.js atual com o destino Cloudflare antes de escolher Pages/Workers. A configuração atual usa Next.js standalone e a documentação original descreve Docker/Dokploy; não presumir que Pages aceite a aplicação sem adaptação.

## Variáveis de ambiente

As variáveis reais serão adicionadas somente no painel seguro do ambiente, nunca commitadas neste repositório. A lista mínima a confirmar inclui:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (somente servidor; nunca NEXT_PUBLIC_)
- NEXT_PUBLIC_PLATFORM_DOMAIN / NEXT_PUBLIC_APP_URL
- segredos do provedor de IA
- segredos LiveKit (API key/secret; somente servidor)
- segredos de e-mail, caso o envio transacional seja habilitado

Usar .env.example apenas com nomes e valores vazios/de exemplo. Não reutilizar credenciais do Team Celeris ou da Celeris Store.

## Etapas e critérios de aceite

1. Auditoria técnica: dependências, migrations, seed, auth, RLS, rotas, pagamentos e serviços externos.
2. Definição institucional: nome, marca, idioma pt-BR, domínio, perfis e regras de matrícula.
3. Adaptação funcional: remover/desabilitar áreas comerciais, configurar experiência de universidade interna e navegação.
4. Segurança e dados: revisar RLS, convites, Storage e políticas de acesso.
5. Integrações: tutor IA, correção assistida e LiveKit.
6. Banco: criar projeto Supabase separado, aplicar migrations revisadas e validar schema.
7. Deploy: pipeline e variáveis seguras; validar build, login, cursos, avaliações, certificados e aulas ao vivo.

## Estado inicial

- Fork criado em solmar-celeris/celeris-academy.
- Branch de trabalho: celeris-academy/setup.
- Nenhum projeto Supabase foi conectado e nenhum segredo foi configurado.
- Nenhuma migration foi aplicada em produção.
