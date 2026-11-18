import { createClient } from "npm:@supabase/supabase-js@2.119.0";
const cors={ "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods":"POST, OPTIONS" };
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
 if(req.method!=="POST") return reply({error:"Método não permitido."},405);
 const url=Deno.env.get("SUPABASE_URL"), anon=Deno.env.get("SUPABASE_ANON_KEY"), secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!anon||!secret) return reply({error:"Configuração segura do Supabase incompleta."},500);
 const auth=req.headers.get("Authorization");
 if(!auth?.startsWith("Bearer ")) return reply({error:"Sessão obrigatória."},401);
 const caller=createClient(url,anon,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data:ud,error:ue}=await caller.auth.getUser(auth.slice(7));
 if(ue||!ud.user) return reply({error:"Sessão inválida."},401);
 const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:p,error:pe}=await admin.from("profiles").select("role,status").eq("id",ud.user.id).maybeSingle();
 if(pe) return reply({error:"Falha ao validar permissões."},500);
 if(p?.role!=="admin"||p?.status!=="active") return reply({error:"Somente administradores podem convidar membros."},403);
 let body:{email?:string;full_name?:string;role?:string};
 try{body=await req.json();}catch{return reply({error:"Corpo inválido."},400);}
 const email=body.email?.trim().toLowerCase(), name=body.full_name?.trim()??"", role=body.role==="instructor"?"instructor":"student";
 if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({error:"Informe um e-mail válido."},400);
 if(name.length>120) return reply({error:"Nome muito longo."},400);
 const redirectTo=Deno.env.get("ACADEMY_INVITE_REDIRECT_URL");
 const {data:inv,error:ie}=await admin.auth.admin.inviteUserByEmail(email,{data:{full_name:name},...(redirectTo?{redirectTo}:{})});
 if(ie) return reply({error:ie.message},ie.status===422?409:400);
 const {error:se}=await admin.from("profiles").upsert({id:inv.user.id,email,full_name:name,role,status:"invited"},{onConflict:"id"});
 if(se) return reply({error:"Convite enviado, mas falhou o perfil."},500);
 return reply({invited:true,user_id:inv.user.id,email,role},201);
});