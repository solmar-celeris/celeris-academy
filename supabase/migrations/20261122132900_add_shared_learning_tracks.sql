-- Shared learning paths available to every active Academy member.
-- Global tracks intentionally use sector_id = NULL; existing RLS allows all active
-- members to access published courses without a sector assignment.
with track_seed(title, slug, description) as (
  values
    ('Onboarding Institucional', 'onboarding-institucional', 'Formação inicial comum a todos os integrantes: história do projeto, cultura, segurança na oficina e uso do Team Celeris.'),
    ('Gestão e Sustentabilidade', 'gestao-e-sustentabilidade', 'Competências transversais para todos os integrantes: organização do trabalho, análise de falhas, controle de insumos, ecoeficiência e comunicação institucional.')
)
insert into public.courses (title, slug, description, sector_id, status)
select t.title, t.slug, t.description, null, 'published'
from track_seed t
where not exists (select 1 from public.courses c where c.slug=t.slug);

with module_seed(track_slug, title, description, position) as (
  values
    ('onboarding-institucional', 'História do Projeto', 'Origem, trajetória, objetivos e evolução do SolMar Celeris.', 1),
    ('onboarding-institucional', 'Cultura, Valores e Identidade Celeris', 'Princípios de atuação, colaboração, protagonismo, responsabilidade e identidade institucional.', 2),
    ('onboarding-institucional', 'Segurança na Oficina', 'Condutas, riscos, equipamentos de proteção, organização do ambiente e procedimentos seguros de trabalho.', 3),
    ('onboarding-institucional', 'Como Utilizar o Team Celeris', 'Orientações para acessar e utilizar os espaços, ferramentas, registros e fluxos de comunicação do Team Celeris.', 4),
    ('gestao-e-sustentabilidade', 'Scrumban e Organização do Trabalho', 'Organização visual das atividades, fluxo de trabalho, prioridades, acompanhamento e melhoria contínua.', 1),
    ('gestao-e-sustentabilidade', 'Análise de Falhas e Aprendizado', 'Identificação, registro, investigação e tratamento de falhas, causas e ações corretivas.', 2),
    ('gestao-e-sustentabilidade', 'Controle de Insumos e Recursos', 'Acompanhamento do uso, armazenamento, disponibilidade e movimentação de materiais e insumos.', 3),
    ('gestao-e-sustentabilidade', 'Ecoeficiência e Sustentabilidade', 'Uso responsável de materiais e energia, redução de desperdícios e consideração de impactos ambientais.', 4),
    ('gestao-e-sustentabilidade', 'Comunicação Institucional', 'Comunicação clara entre integrantes e áreas, registros, apresentação de resultados e representação institucional.', 5)
)
insert into public.course_modules (course_id, title, description, position)
select c.id, m.title, m.description, m.position
from module_seed m
join public.courses c on c.slug=m.track_slug
where not exists (
  select 1 from public.course_modules existing
  where existing.course_id=c.id and existing.title=m.title
);