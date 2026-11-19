import http from 'node:http';
import {readFileSync,writeFileSync,renameSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {WebSocketServer} from 'ws';
import {Game,validateBank} from './engine.mjs';
import {announcement,WinnerVoice} from './voice.mjs';
import {LiveLink} from './tiktok.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),runtime=resolve(process.env.DATA_DIR||resolve(root,'data/runtime'));
mkdirSync(runtime,{recursive:true});
const read=(name,fallback)=>{try{return JSON.parse(readFileSync(resolve(runtime,name),'utf8'));}catch(e){if(e.code!=='ENOENT')console.warn(`Không đọc được ${name}; giữ nguyên file và không ghi đè.`);return fallback;}};
const statePath=resolve(runtime,'state.json');let saveBlocked=false;
if(existsSync(statePath)){try{JSON.parse(readFileSync(statePath,'utf8'));}catch{saveBlocked=true;}}
const game=new Game(read('questions.json',JSON.parse(readFileSync(resolve(root,'data/questions.json'),'utf8'))),{saved:read('state.json',{})});
const host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||3010),token=process.env.ADMIN_TOKEN||'';
if(host!=='127.0.0.1'&&(!token||token.length<24))throw Error('Mở mạng LAN cần ADMIN_TOKEN ít nhất 24 ký tự.');
let dirty=true,lastVersion=-1,cache='',lastStats=0,revision=0;
const voice=new WinnerVoice();
const changed=priority=>{dirty=true;if(priority==='winner')flush();}; const live=new LiveLink(game,changed);
const catalog=()=>({categories:[...new Set(game.bank.map(q=>q.category))].sort(),types:[...new Set(game.bank.map(q=>q.type))],total:game.bank.length,counts:Object.fromEntries([...new Set(game.bank.map(q=>q.category))].map(c=>[c,game.bank.filter(q=>q.category===c).length]))});
const validHost=req=>{try{return ['localhost','127.0.0.1',host,...(process.env.ALLOWED_HOSTS||'').split(',').map(s=>s.trim())].includes(new URL('http://'+req.headers.host).hostname);}catch{return false;}};
const validOrigin=req=>!req.headers.origin||req.headers.origin===`http://${req.headers.host}`;
const authorized=req=>!token||req.headers.authorization===`Bearer ${token}`;
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.ttf':'font/ttf'};
const staticFiles=new Set(['index.html','overlay.html','style.css','control.js','overlay.js','speech.js','fonts/be-vietnam-pro-600.ttf','fonts/be-vietnam-pro-800.ttf']);
function json(res,status,obj){res.writeHead(status,{'Content-Type':mime['.json'],'Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
const server=http.createServer(async(req,res)=>{
 if(!validHost(req)||!validOrigin(req))return json(res,403,{error:'Nguồn truy cập không hợp lệ'});
 const url=new URL(req.url,'http://localhost');
 if(req.method==='GET'&&url.pathname==='/api/winner-voice'){
  const round=Number(url.searchParams.get('round')),winner=game.winners[0];
  if(!game.settings.speech||game.phase!=='reveal'||round!==game.round||!winner)return json(res,409,{error:'Không có kết quả cần đọc'});
  try{const audio=await voice.get(`${round}:${game.lastEvent?.id}`,announcement(game.current.answer,winner.name));res.writeHead(200,{'Content-Type':'audio/mpeg','Cache-Control':'no-store'});res.end(audio);}catch{return json(res,503,{error:'Giọng trực tuyến chưa sẵn sàng. Hãy bật giọng tiếng Việt trên máy.'});}return;
 }
 if(url.pathname.startsWith('/api/')){
  if(!authorized(req))return json(res,401,{error:'Cần mã quản trị'});
  if(req.method==='GET'&&url.pathname==='/api/bank'){res.writeHead(200,{'Content-Type':mime['.json'],'Content-Disposition':'attachment; filename="questions.json"'});return res.end(JSON.stringify(game.bank,null,2));}
  if(req.method==='POST'&&url.pathname==='/api/bank'){
   let size=0,chunks=[];try{for await(const c of req){size+=c.length;if(size>5*1024*1024){json(res,413,{error:'File tối đa 5 MB'});req.resume();return;}chunks.push(c);}const bank=validateBank(JSON.parse(Buffer.concat(chunks).toString()));writeFileSync(resolve(runtime,'questions.json.tmp'),JSON.stringify(bank));renameSync(resolve(runtime,'questions.json.tmp'),resolve(runtime,'questions.json'));game.replaceBank(bank);changed();broadcastCatalog();return json(res,200,{ok:true,...catalog()});}catch(e){return json(res,400,{error:e.message});}
  }
  return json(res,404,{error:'Không tìm thấy'});
 }
 const file=url.pathname==='/'?'index.html':url.pathname.slice(1);if(!staticFiles.has(file))return json(res,404,{error:'Không tìm thấy'});
 try{const content=readFileSync(resolve(root,'public',file));res.writeHead(200,{'Content-Type':mime[extname(file)],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https: data:; connect-src 'self'; frame-ancestors 'self'"});res.end(content);}catch{json(res,500,{error:'Không đọc được tài nguyên'});}
});
const wss=new WebSocketServer({noServer:true,maxPayload:16*1024,perMessageDeflate:false});
server.on('upgrade',(req,socket,head)=>{const u=new URL(req.url,'http://localhost');if(u.pathname!=='/ws'||!validHost(req)||!validOrigin(req)){socket.destroy();return;}const role=u.searchParams.get('role')==='control'?'control':'overlay';if(role==='control'&&token&&u.searchParams.get('key')!==token){socket.destroy();return;}wss.handleUpgrade(req,socket,head,ws=>{ws.role=role;wss.emit('connection',ws,req);});});
function send(ws,obj){if(ws.readyState===1&&ws.bufferedAmount<512*1024)ws.send(typeof obj==='string'?obj:JSON.stringify(obj));}
function broadcastCatalog(){for(const ws of wss.clients)if(ws.role==='control')send(ws,{t:'catalog',...catalog()});}
const snapshot=()=>({t:'state',...game.snapshot(),live:live.state});
wss.on('connection',ws=>{
 ws.alive=true;ws.on('pong',()=>ws.alive=true);send(ws,snapshot());if(ws.role==='control')send(ws,{t:'catalog',...catalog()});
 let windowStart=Date.now(),commands=0;
 ws.on('message',async raw=>{if(ws.role!=='control')return;if(Date.now()-windowStart>1000){commands=0;windowStart=Date.now();}if(++commands>30)return;
  try{const m=JSON.parse(raw);switch(m.cmd){
   case 'settings':game.configure(m.settings||{});break;
   case 'start':case 'next':game.next();break;
   case 'pause':game.pause();break;
   case 'reveal':game.reveal();break;
   case 'stop':game.stop();break;
   case 'reset':if(m.confirm!=='XÓA')throw Error('Gõ XÓA để xác nhận.');game.reset();break;
   case 'connect':await live.connect(m.username);break;
   case 'disconnect':await live.disconnect();break;
   case 'demoCorrect':if(['connected','connecting'].includes(live.state.status))throw Error('Ngắt LIVE thật trước khi thử.');if(game.phase!=='question')throw Error('Bắt đầu câu hỏi trước.');game.comment({id:'demo:'+String(m.name||'Khách').slice(0,80),name:String(m.name||'Khách')+' · thử',text:game.current.answer,round:m.round});break;
   case 'simulate':if(['connected','connecting'].includes(live.state.status))throw Error('Ngắt kết nối LIVE thật trước khi thử.');game.comment({id:'demo:'+String(m.name||'Khách').slice(0,80),name:String(m.name||'Khách')+' · thử',text:String(m.text||''),round:m.round});break;
   case 'demoGift':if(['connected','connecting'].includes(live.state.status))throw Error('Ngắt LIVE thật trước khi thử.');game.gift({id:'demo:'+String(m.name||'Khách').slice(0,80),name:String(m.name||'Khách')+' · thử',diamonds:Number(m.diamonds)});break;
   default:throw Error('Lệnh không hợp lệ');
  }changed();send(ws,{t:'ok',cmd:m.cmd});}catch(e){send(ws,{t:'error',error:e.message});}
 });
});
// A real LIVE winner is sent immediately; routine stats remain coalesced at 10 Hz.
function flush(){lastVersion=game.version;dirty=false;lastStats=Date.now();cache=JSON.stringify(snapshot());for(const ws of wss.clients)send(ws,cache);}
const loop=setInterval(()=>{game.tick();const statsDue=Date.now()-lastStats>=1000;if(game.version!==lastVersion||dirty||statsDue)flush();},100);
function save(){if(saveBlocked)return;try{const out=game.export();out.players=out.players.filter(p=>!p.id.startsWith('demo:'));writeFileSync(statePath+'.tmp',JSON.stringify(out));renameSync(statePath+'.tmp',statePath);}catch(e){console.error('Không lưu được điểm:',e.message);}}
const saver=setInterval(save,3000),heartbeat=setInterval(()=>{for(const ws of wss.clients){if(!ws.alive){ws.terminate();continue;}ws.alive=false;ws.ping();}},30000);
server.listen(port,host,()=>console.log(`Trả lời nhanh: http://${host}:${port}\nMàn hình LIVE: http://${host}:${port}/overlay.html`));
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,async()=>{clearInterval(loop);clearInterval(saver);clearInterval(heartbeat);save();await live.disconnect();for(const w of wss.clients)w.terminate();server.close(()=>process.exit(0));});
