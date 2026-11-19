import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {once} from 'node:events';import WebSocket from 'ws';
test('server serves UI, rejects hostile requests, protects controls, handles real WS bursts',async t=>{
 const dir=mkdtempSync(join(tmpdir(),'quiz-')),port=18000+Math.floor(Math.random()*10000),base=`http://127.0.0.1:${port}`,token='test-token-with-at-least-24-characters';
 const child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:String(port),DATA_DIR:dir,ADMIN_TOKEN:token},stdio:['ignore','pipe','pipe']});let sockets=[];
 t.after(async()=>{for(const ws of sockets)ws.terminate();child.kill('SIGTERM');await Promise.race([once(child,'exit'),new Promise(r=>setTimeout(r,2000))]);rmSync(dir,{recursive:true,force:true});});
 await Promise.race([once(child.stdout,'data'),new Promise((_,r)=>setTimeout(()=>r(Error('Startup timeout')),5000))]);
 assert.equal((await fetch(base)).status,200);assert.equal((await fetch(base+'/server/index.mjs')).status,404);assert.equal((await fetch(base,{headers:{Origin:'https://evil.example'}})).status,403);assert.equal((await fetch(base+'/api/bank')).status,401);
 const headers={Authorization:`Bearer ${token}`};assert.equal((await fetch(base+'/api/bank',{headers})).status,200);
 const malformed=await fetch(base+'/api/bank',{method:'POST',headers,body:'[]'});assert.equal(malformed.status,400);
 const bank=[{id:'test',category:'Test',type:'text',prompt:'Gõ đúng?',answer:'đúng'}];assert.equal((await fetch(base+'/api/bank',{method:'POST',headers,body:JSON.stringify(bank)})).status,200);
 const control=new WebSocket(`ws://127.0.0.1:${port}/ws?role=control&key=${token}`);sockets.push(control);await once(control,'open');let latest;control.on('message',raw=>{const m=JSON.parse(raw);if(m.t==='state')latest=m;});
 const waitFor=async fn=>{const end=Date.now()+5000;while(Date.now()<end){if(fn())return;await new Promise(r=>setTimeout(r,30));}throw Error('State timeout');};
 control.send(JSON.stringify({cmd:'settings',settings:{mode:'all',auto:false}}));control.send(JSON.stringify({cmd:'start'}));await waitFor(()=>latest?.phase==='question');
 const reader=new WebSocket(`ws://127.0.0.1:${port}/ws`);sockets.push(reader);await once(reader,'open');reader.send(JSON.stringify({cmd:'reset',confirm:'XÓA'}));
 // Independent control sockets represent batches; regular viewers cannot send admin commands.
 for(let i=0;i<20;i++){control.send(JSON.stringify({cmd:'simulate',name:'Test '+i,text:'dung',round:latest.round}));}
 await waitFor(()=>latest?.stats.accepted===20);assert.equal(latest.phase,'question');assert.equal((await fetch(base+'/api/winner-voice?round='+latest.round)).status,409);assert.equal(latest.topScores.length,10);assert(!latest.question.answer);
 control.send(JSON.stringify({cmd:'reveal'}));await waitFor(()=>latest.phase==='reveal');assert.equal(latest.question.answer,'đúng');
});
