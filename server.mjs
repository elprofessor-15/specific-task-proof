import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {runProof} from './src/proof.mjs';
const assets={'/':'index.html','/app.js':'app.js','/style.css':'style.css','/src/evidence.mjs':'src/evidence.mjs'};let busy=false;
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 if(url.pathname==='/api/proof'&&req.method==='POST'){
  if(req.headers.origin&&!['http://127.0.0.1:5188','http://localhost:5188'].includes(req.headers.origin))return json(403,{error:'Origin rejected'});
  if(busy)return json(409,{error:'A proof run is already in progress.'});
  const mode=url.searchParams.get('mode'); if(!['weak','strict'].includes(mode))return json(400,{error:'Invalid verifier version'});
  busy=true;try{json(200,await runProof(mode));}catch(e){json(500,{error:e.message});}finally{busy=false;}return;
 }
 if(req.method!=='GET'||!assets[url.pathname])return json(404,{error:'Not found'});
 try{res.writeHead(200,{'Content-Type':/\.m?js$/.test(url.pathname)?'text/javascript':url.pathname.endsWith('.css')?'text/css':'text/html','X-Content-Type-Options':'nosniff'});res.end(await readFile(new URL(assets[url.pathname],import.meta.url)));}catch{json(500,{error:'Asset unavailable'});}
});
server.listen(5188,'127.0.0.1',()=>console.log('Task Proof: http://127.0.0.1:5188'));
