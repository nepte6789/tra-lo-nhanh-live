import test from 'node:test';import assert from 'node:assert/strict';
import {AutoConnect} from '../server/auto-connect.mjs';
function fixture(status={status:'error'}){
 let timer=null,calls=0;const auto=new AutoConnect({connect:async()=>{calls++},getStatus:()=>status,now:()=>1000,setTimer:(fn,delay)=>(timer={fn,delay}),clearTimer:()=>{timer=null}});
 return {auto,status,get timer(){return timer},get calls(){return calls}};
}
test('retries after two minutes, respects provider delay, manual stop cancels',async()=>{
 const f=fixture({status:'error',retryAfterMs:180000});f.auto.setTarget('@test',{immediate:true});assert.equal(f.timer.delay,0);await f.timer.fn();assert.equal(f.calls,1);assert.equal(f.timer.delay,180000);assert.equal(f.auto.state.nextAttemptAt,181000);f.auto.stop();assert.equal(f.timer,null);await f.auto.attempt();assert.equal(f.calls,1);
});
test('permission failures stop retries and healthy connections are not reconnected',async()=>{
 const f=fixture({status:'error',code:'SIGN_PERMISSION'});f.auto.setTarget('test',{immediate:true});await f.timer.fn();assert.equal(f.auto.state.phase,'blocked');assert.equal(f.auto.state.nextAttemptAt,null);
 const h=fixture({status:'connected',uniqueId:'test'});h.auto.setTarget('test',{immediate:true});await h.timer.fn();assert.equal(h.calls,0);assert.equal(h.timer.delay,120000);h.auto.disconnected();assert.equal(h.auto.state.phase,'retry');
});
test('switching target while connecting does not overlap attempts',async()=>{
 let release;const f=fixture();f.auto.connect=()=>new Promise(r=>release=r);f.auto.setTarget('first',{immediate:true});const pending=f.timer.fn();f.auto.setTarget('second',{immediate:true});assert.equal(f.auto.state.phase,'waiting');release();await pending;assert.equal(f.auto.state.target,'second');assert.equal(f.timer.delay,0);f.auto.stop();
});
