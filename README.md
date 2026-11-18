# Celeris Academy

Universidade corporativa interna da SolMar Celeris. A plataforma será dedicada à formação dos membros da equipe, com cursos, aulas, avaliações, certificados, encontros ao vivo e apoio de inteligência artificial.

## Base técnica

- Next.js 16, React 19 e TypeScript
- Cloudflare Workers com OpenNext
- Wrangler para configuração e execução do Worker
- Supabase exclusivo do Celeris Academy (a configurar)
- LiveKit para aulas ao vivo (integração futura)
- Tutor de IA com credenciais mantidas exclusivamente no servidor

## Desenvolvimento

Requisitos: Node.js 22 ou superior.

    npm install
    npm run dev

Abra http://localhost:3000.

## Verificação

    npm run typecheck
    npm run build

## Cloudflare

Os arquivos open-next.config.ts e wrangler.jsonc ficam na raiz do projeto.

Comando de build do Cloudflare:

    npx opennextjs-cloudflare build

O diretório raiz do projeto é a própria raiz deste repositório. Não configure um diretório de saída estática.

## Variáveis de ambiente

Use .env.example como referência. Credenciais reais devem ser configuradas nos ambientes seguros, nunca commitadas.

O Celeris Academy terá um projeto Supabase próprio. Não reutilize projetos, chaves ou dados do Team Celeris ou da Celeris Store.

## Estado do produto

Esta reconstrução estabelece a base de interface e implantação. Autenticação, banco, cursos persistidos, permissões, certificados, LiveKit e tutor IA serão conectados em etapas próprias, depois da criação e validação do projeto Supabase exclusivo.
