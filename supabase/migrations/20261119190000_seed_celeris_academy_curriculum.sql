-- Initial Celeris Academy curriculum structure based on the revised SolMar Celeris organizational manual.
-- Creates six sectors, one learning track per sector, and empty modules.
-- No lessons, videos, files, assessments, or other teaching materials are inserted.

with sector_seed(name, slug, description, position) as (
  values
    ('Gestão', 'gestao', 'Integração, desenvolvimento e continuidade dos membros, capacitação e relacionamento com patrocinadores e apoiadores.', 1),
    ('Financeiro', 'financeiro', 'Organização administrativa e controle responsável dos recursos financeiros, materiais e patrimoniais.', 2),
    ('Marketing', 'marketing', 'Identidade e comunicação do SolMar Celeris, desenvolvimento de produtos e presença nos canais de divulgação.', 3),
    ('Mecânica Naval', 'mecanica-naval', 'Projeto, desenvolvimento e validação do casco, da estrutura e dos componentes mecânicos do protótipo.', 4),
    ('Elétrica', 'eletrica', 'Projeto, integração e validação de geração, armazenamento, distribuição, alimentação, proteção e acionamento elétricos da embarcação.', 5),
    ('Telemetria', 'telemetria', 'Circuitos, sensores, instrumentação, microcontroladores, sistemas embarcados, automação, controle e telemetria.', 6)
)
insert into public.sectors (name, slug, description, position, active)
select name, slug, description, position, true from sector_seed
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    position = excluded.position,
    active = true;

-- Normalize legacy sector names when this migration is applied to a database
-- that already contains the earlier labels.
update public.sectors set name = 'Gestão', slug = 'gestao'
where slug in ('gestao-de-pessoas', 'gestao-pessoas') and not exists
  (select 1 from public.sectors s2 where s2.slug = 'gestao' and s2.id <> sectors.id);
update public.sectors set name = 'Financeiro', slug = 'financeiro'
where slug in ('administrativo-financeiro', 'administrativo-financeiro-af') and not exists
  (select 1 from public.sectors s2 where s2.slug = 'financeiro' and s2.id <> sectors.id);
update public.sectors set name = 'Telemetria', slug = 'telemetria'
where slug in ('eletronica-elt', 'eletronica') and not exists
  (select 1 from public.sectors s2 where s2.slug = 'telemetria' and s2.id <> sectors.id);

with track_seed(sector_slug, title, slug, description) as (
  values
    ('gestao', 'Gestão de Pessoas e Desenvolvimento da Equipe', 'trilha-gestao', 'Integração, desenvolvimento de competências, capacitação, relacionamento institucional e continuidade do conhecimento.'),
    ('financeiro', 'Gestão Financeira e Administrativa', 'trilha-financeiro', 'Planejamento financeiro, orçamento, compras, fornecedores, patrimônio e documentação.'),
    ('marketing', 'Comunicação, Marketing e Produtos', 'trilha-marketing', 'Identidade institucional, desenvolvimento de produtos, redes sociais, campanhas e divulgação dos resultados.'),
    ('mecanica-naval', 'Projeto e Desenvolvimento Mecânico Naval', 'trilha-mecanica-naval', 'Desenvolvimento do casco, estrutura, propulsão, direção, fabricação, montagem e validação do protótipo.'),
    ('eletrica', 'Sistemas Elétricos da Embarcação', 'trilha-eletrica', 'Geração solar, armazenamento, distribuição, proteção, alimentação, acionamento e eficiência energética.'),
    ('telemetria', 'Eletrônica, Instrumentação e Telemetria', 'trilha-telemetria', 'Circuitos, sensores, microcontroladores, sistemas embarcados, aquisição de dados, automação, controle e telemetria.')
)
insert into public.courses (title, slug, description, sector_id, status)
select t.title, t.slug, t.description, s.id, 'published'
from track_seed t
join public.sectors s on s.slug = t.sector_slug
where not exists (select 1 from public.courses c where c.slug = t.slug);

with module_seed(track_slug, title, description, position) as (
  values
    ('trilha-gestao', 'Integração e Acompanhamento de Membros', 'Acolhimento, integração, adaptação e acompanhamento da participação dos integrantes.', 1),
    ('trilha-gestao', 'Competências e Desenvolvimento', 'Mapeamento de competências, matriz de competências e identificação de necessidades de capacitação.', 2),
    ('trilha-gestao', 'Capacitação e Registros de Aprendizagem', 'Organização dos treinamentos, registros de participação e acompanhamento do desenvolvimento.', 3),
    ('trilha-gestao', 'Patrocínios e Relacionamento Institucional', 'Prospecção, contatos iniciais, apresentação de oportunidades e acompanhamento de patrocinadores e apoiadores.', 4),
    ('trilha-gestao', 'Integração entre Áreas e Transferência de Conhecimento', 'Articulação com Financeiro e Marketing e preservação do conhecimento entre gerações da equipe.', 5),

    ('trilha-financeiro', 'Planejamento Financeiro e Orçamentário', 'Elaboração e atualização do orçamento, receitas, despesas e saldo disponível.', 1),
    ('trilha-financeiro', 'Fluxo de Caixa e Prestação de Contas', 'Previsões de custos, fluxo de caixa, comprovantes e registros de prestação de contas.', 2),
    ('trilha-financeiro', 'Compras, Cotações e Fornecedores', 'Levantamento de necessidades, comparação de propostas, negociação e acompanhamento de pedidos.', 3),
    ('trilha-financeiro', 'Patrimônio, Estoque e Movimentação de Bens', 'Inventário de equipamentos, ferramentas e materiais, entradas, saídas e responsáveis.', 4),
    ('trilha-financeiro', 'Documentação e Formalização de Recursos', 'Organização de contratos, notas fiscais, documentos administrativos e registros financeiros de patrocínios.', 5),

    ('trilha-marketing', 'Identidade Visual e Comunicação Institucional', 'Coerência visual e textual e desenvolvimento de materiais institucionais e de divulgação.', 1),
    ('trilha-marketing', 'Desenvolvimento e Gestão de Produtos', 'Planejamento, custos, protótipos visuais, apresentação, qualidade, estoque e resultados de vendas.', 2),
    ('trilha-marketing', 'Redes Sociais e Calendário Editorial', 'Planejamento e publicação de conteúdos, produção de registros e acompanhamento de mensagens e engajamento.', 3),
    ('trilha-marketing', 'Campanhas, Vendas e Ações Promocionais', 'Planejamento de campanhas, ações promocionais e divulgação de produtos.', 4),
    ('trilha-marketing', 'Apresentações, Patrocínios e Divulgação de Resultados', 'Materiais de contrapartida em conjunto com Gestão e divulgação de resultados técnicos, eventos e conquistas.', 5),

    ('trilha-mecanica-naval', 'Casco e Estrutura Naval', 'Desenvolvimento, revisão e validação do casco e da estrutura da embarcação.', 1),
    ('trilha-mecanica-naval', 'Propulsão, Transmissão e Direção', 'Projeto dos sistemas de propulsão, transmissão, direção e hélice.', 2),
    ('trilha-mecanica-naval', 'Modelagem 3D e Desenho Técnico', 'Modelos tridimensionais, montagens, detalhamento e documentação técnica.', 3),
    ('trilha-mecanica-naval', 'Fabricação, Montagem e Inspeção', 'Planejamento dos processos de fabricação, montagem, inspeção e validação.', 4),
    ('trilha-mecanica-naval', 'Manutenção, Testes e Integração de Sistemas', 'Manutenção, testes, registro de falhas e compatibilização física com Elétrica e Telemetria.', 5),

    ('trilha-eletrica', 'Geração Solar e Conversão de Energia', 'Projeto e integração dos sistemas de geração solar e seus componentes.', 1),
    ('trilha-eletrica', 'Armazenamento de Energia e Baterias', 'Dimensionamento e organização de baterias, bancos de armazenamento e BMS.', 2),
    ('trilha-eletrica', 'Controladores de Carga e MPPT', 'Integração de controladores de carga, MPPT e componentes associados ao armazenamento.', 3),
    ('trilha-eletrica', 'Distribuição, Cabeamento e Proteções', 'Alimentação, distribuição, condutores, conexões, proteções e segurança elétrica.', 4),
    ('trilha-eletrica', 'Acionamento, Desempenho e Diagnóstico', 'Controladores de motor, ensaios, medições, autonomia, eficiência e diagnóstico de falhas.', 5),
    ('trilha-eletrica', 'Integração Elétrica e Interfaces de Monitoramento', 'Compatibilização da instalação com Mecânica Naval e alinhamento de sinais com Telemetria.', 6),

    ('trilha-telemetria', 'Fundamentos de Eletrônica e Circuitos', 'Circuitos, componentes eletrônicos, montagem, integração e diagnóstico.', 1),
    ('trilha-telemetria', 'Sensores e Instrumentação', 'Seleção, integração e utilização de sensores e instrumentos para grandezas operacionais.', 2),
    ('trilha-telemetria', 'Microcontroladores e Sistemas Embarcados', 'Programação e integração de microcontroladores, dispositivos e módulos embarcados.', 3),
    ('trilha-telemetria', 'Aquisição, Processamento e Comunicação de Dados', 'Aquisição, processamento, transmissão, armazenamento e visualização de dados operacionais.', 4),
    ('trilha-telemetria', 'Telemetria e Monitoramento Operacional', 'Monitoramento de tensão, corrente, temperatura, velocidade e outras grandezas pertinentes.', 5),
    ('trilha-telemetria', 'Automação, Controle e Comandos', 'Automações, acionamentos, comandos, rotinas de controle e respostas a condições monitoradas.', 6),
    ('trilha-telemetria', 'Testes, Calibração e Integração entre Setores', 'Inspeção, calibração, diagnóstico e alinhamento de interfaces com Elétrica e Mecânica Naval.', 7)
)
insert into public.course_modules (course_id, title, description, position)
select c.id, m.title, m.description, m.position
from module_seed m
join public.courses c on c.slug = m.track_slug
where not exists (
  select 1 from public.course_modules existing
  where existing.course_id = c.id and existing.title = m.title
);
