-- Explicit technical competencies requested for the subsystem learning paths.
update public.course_modules m
set title='Modelagem CAD e SolidWorks',
    description='Modelagem tridimensional, montagem, detalhamento e documentação técnica utilizando ferramentas CAD e SolidWorks.'
from public.courses c
where c.id=m.course_id and c.slug='trilha-mecanica-naval'
  and m.title='Modelagem 3D e Desenho Técnico';

update public.course_modules m
set title='Sistemas Fotovoltaicos e Conversão de Energia',
    description='Projeto, integração e avaliação dos módulos fotovoltaicos e dos componentes de conversão e geração solar.'
from public.courses c
where c.id=m.course_id and c.slug='trilha-eletrica'
  and m.title='Geração Solar e Conversão de Energia';

insert into public.course_modules (course_id,title,description,position)
select c.id,v.title,v.description,v.position
from public.courses c
cross join (values
 ('Hidrodinâmica do Casco','Fundamentos de hidrodinâmica, resistência ao avanço, escoamento ao redor do casco e avaliação de geometrias.',6),
 ('Laminação e Fabricação do Casco','Materiais, preparação de moldes, laminação, cura, acabamento, inspeção e segurança nos processos.',7)
) as v(title,description,position)
where c.slug='trilha-mecanica-naval'
and not exists(select 1 from public.course_modules m where m.course_id=c.id and m.title=v.title);

insert into public.course_modules (course_id,title,description,position)
select c.id,v.title,v.description,v.position
from public.courses c
cross join (values
 ('Propulsão Elétrica e Controle de Motor','Integração do motor elétrico, controlador, acionamento, dimensionamento e avaliação de desempenho da propulsão.',7)
) as v(title,description,position)
where c.slug='trilha-eletrica'
and not exists(select 1 from public.course_modules m where m.course_id=c.id and m.title=v.title);

insert into public.course_modules (course_id,title,description,position)
select c.id,v.title,v.description,v.position
from public.courses c
cross join (values
 ('Eletrônica Embarcada','Arquitetura eletrônica embarcada, circuitos, interfaces, alimentação, proteção e integração dos dispositivos a bordo.',8)
) as v(title,description,position)
where c.slug='trilha-telemetria'
and not exists(select 1 from public.course_modules m where m.course_id=c.id and m.title=v.title);