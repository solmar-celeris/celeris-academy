"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

type Sector={id:string;name:string;description:string};
type Lesson={id:string;title:string;description:string;content_type:string;content:string;media_path:string|null};
type Module={id:string;title:string;description:string;lessons:Lesson[]};
type Course={id:string;title:string;description:string;course_modules:Module[]};

export default function PortalPage(){
  const router=useRouter();const [client,setClient]=useState<any>(null);const [email,setEmail]=useState("");const [sector,setSector]=useState("");const [sectors,setSectors]=useState<Sector[]>([]);const [generalCourses,setGeneralCourses]=useState<Course[]>([]);const [sectorCourses,setSectorCourses]=useState<Course[]>([]);const [urls,setUrls]=useState<Record<string,string>>({});const [loading,setLoading]=useState(true);const [changing,setChanging]=useState(false);const [message,setMessage]=useState("");
  async function loadTracks(sb:any,sectorId:string){
    const base="id,title,description,course_modules(id,title,description,position,lessons(id,title,description,content_type,content,media_path))";
    const generalRequest=sb.from("courses").select(base).is("sector_id",null).eq("status","published").order("created_at");
    const sectorRequest=sectorId?sb.from("courses").select(base).eq("sector_id",sectorId).eq("status","published").order("created_at"):Promise.resolve({data:[],error:null});
    const [generalResult,sectorResult]=await Promise.all([generalRequest,sectorRequest]);
    if(generalResult.error||sectorResult.error){setMessage(generalResult.error?.message||sectorResult.error?.message||"Não foi possível carregar as trilhas.");return;}
    const general=(generalResult.data??[]) as Course[],specific=(sectorResult.data??[]) as Course[];
    setGeneralCourses(general);setSectorCourses(specific);
    const all=[...general,...specific];
    const paths=all.flatMap(c=>c.course_modules??[]).flatMap(m=>m.lessons??[]).filter(l=>l.media_path).map(l=>l.media_path as string);
    const signed:Record<string,string>={};for(const path of paths){const {data:d}=await sb.storage.from("academy-course-media").createSignedUrl(path,3600);if(d?.signedUrl)signed[path]=d.signedUrl;}setUrls(signed);
  }
  useEffect(()=>{let live=true;(async()=>{const sb=await getSupabase();if(!sb){router.replace("/login");return;}const {data:{user}}=await sb.auth.getUser();if(!user){router.replace("/login");return;}const {data:p}=await sb.from("profiles").select("role,status,sector_id,email").eq("id",user.id).maybeSingle();if(!p||p.status!=="active"){router.replace("/login");return;}if(p.role==="admin"){router.replace("/admin");return;}const {data:s}=await sb.from("sectors").select("id,name,description").eq("active",true).order("position").order("name");if(!live)return;setClient(sb);setEmail(user.email??"");setSectors(s??[]);setSector(p.sector_id??"");await loadTracks(sb,p.sector_id??"");if(live)setLoading(false);})();return()=>{live=false};},[router]);
  async function chooseSector(id:string){setChanging(true);setMessage("");const {error}=await client.from("profiles").update({sector_id:id}).eq("id",(await client.auth.getUser()).data.user?.id);if(error){setMessage(error.message);setChanging(false);return;}setSector(id);await loadTracks(client,id);setChanging(false);}
  async function signOut(){await client?.auth.signOut();router.replace("/");}
  const renderCourses=(list:Course[])=>(list.map(course=><article className="student-course" key={course.id}><div className="course-heading"><div><span className="panel-kicker">TRILHA DE APRENDIZAGEM</span><h3>{course.title}</h3><p>{course.description}</p></div></div><div className="student-modules">{(course.course_modules??[]).map((m,i)=><details className="student-module" key={m.id}><summary><span className="module-number">{String(i+1).padStart(2,"0")}</span><span className="module-summary"><strong>{m.title}</strong><small>{m.description||"Abra para acessar os treinamentos"}</small></span><span className="plus-mark">+</span></summary><div className="student-lessons">{(m.lessons??[]).map(l=><div className="student-lesson" key={l.id}><div className="lesson-icon">{l.content_type==="video"?"▶":l.content_type==="resource"?"↧":"▤"}</div><div className="lesson-copy"><strong>{l.title}</strong><p>{l.description}</p>{l.content&&<p className="lesson-body">{l.content}</p>}{l.media_path&&urls[l.media_path]&&(l.content_type==="video"?<video controls preload="metadata" src={urls[l.media_path]}/>:<a className="file-link" href={urls[l.media_path]} target="_blank" rel="noreferrer">Abrir / baixar arquivo ↗</a>)}</div></div>)}</div></details>)}</div></article>));
  if(loading)return <main className="academy-loading">Preparando sua área de aprendizagem...</main>;
  return <main className="academy-portal"><header className="academy-header"><a className="brand" href="/"><img className="brand-logo" src="/solmar-celeris-logo.png" alt="SolMar Celeris"/><span className="brand-copy"><strong>SOLMAR CELERIS</strong><small>ACADEMY · ALUNO</small></span></a><div className="admin-header-actions"><span className="student-email">{email}</span><button className="outline-button" onClick={signOut}>Sair</button></div></header>
    <section className="student-welcome"><div className="eyebrow"><span/> SUA JORNADA DE DESENVOLVIMENTO</div><h1>Aprender para<br/><em>fazer acontecer.</em></h1><p>Uma formação comum a todos os integrantes, complementada pelas trilhas técnicas do seu setor de atuação.</p></section>
    <section className="student-content">
      <div className="track-heading"><div><div className="panel-kicker">EIXO 01 · FORMAÇÃO GERAL</div><h2>Formação institucional e transversal</h2><p>Estas trilhas são comuns a todos os integrantes, independentemente do setor.</p></div><span>{generalCourses.length} trilha(s)</span></div>
      {generalCourses.length?renderCourses(generalCourses):<div className="empty-state">As trilhas gerais ainda não foram publicadas.</div>}
      <div className="sector-picker"><div><div className="panel-kicker">EIXO 02 · FORMAÇÃO TÉCNICA</div><h2>Trilhas por subsistema</h2><p>Escolha seu setor para acessar os conteúdos técnicos específicos da sua área.</p></div><select value={sector} disabled={changing} onChange={e=>chooseSector(e.target.value)}><option value="">Selecione seu setor</option>{sectors.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
      {message&&<p className="admin-message">{message}</p>}
      {!sector?<div className="empty-state">As trilhas gerais já estão disponíveis. Selecione seu setor para visualizar também a formação técnica.</div>:<><div className="track-heading"><div><div className="panel-kicker">TRILHAS DO SETOR</div><h2>{sectors.find(s=>s.id===sector)?.name}</h2></div><span>{sectorCourses.length} trilha(s)</span></div>{sectorCourses.length?renderCourses(sectorCourses):<div className="empty-state">Ainda não há trilhas técnicas publicadas para este setor.</div>}</>}
      <div className="track-heading"><div><div className="panel-kicker">EIXO 03 · FORMAÇÃO TRANSVERSAL</div><h2>Gestão e sustentabilidade</h2><p>Competências para apoiar o trabalho integrado e responsável em toda a equipe.</p></div></div>
      {renderCourses(generalCourses.filter(c=>c.title==="Gestão e Sustentabilidade"))}
    </section><footer className="academy-footer">CELERIS ACADEMY · CONHECIMENTO EM MOVIMENTO</footer></main>;
}
