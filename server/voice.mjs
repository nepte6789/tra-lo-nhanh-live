// Only winner announcements are accepted by the HTTP route; no arbitrary public TTS input.
export function announcement(answer,name){
 const tidy=(s,n)=>String(s||'').normalize('NFC').replace(/[^\p{L}\p{N}\s.,-]/gu,' ').replace(/\s+/g,' ').trim().slice(0,n);
 return `Đáp án là ${tidy(answer,100)}. ${tidy(name,45)||'Người chơi'} trả lời đúng.`;
}
const xml=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
export async function synthesize(text,{timeout=4500}={}){
 let client,timer;
 const work=(async()=>{const {MsEdgeTTS,OUTPUT_FORMAT}=await import('msedge-tts');client=new MsEdgeTTS();await client.setMetadata('vi-VN-HoaiMyNeural',OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);const {audioStream}=client.toStream(xml(text),{rate:'+10%'});const chunks=[];let size=0;await new Promise((resolve,reject)=>{audioStream.on('data',b=>{size+=b.length;if(size>2*1024*1024)reject(Error('Voice too large'));else chunks.push(b);});audioStream.on('error',reject);audioStream.on('end',resolve);audioStream.on('close',resolve);});const out=Buffer.concat(chunks);if(out.length<500)throw Error('Empty speech');return out;})();
 try{return await Promise.race([work,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Voice timeout')),timeout);})]);}finally{clearTimeout(timer);try{client?.close();}catch{}}
}
export class WinnerVoice {
 constructor(make=synthesize){this.make=make;this.cache=new Map();this.active=0;}
 get(key,text){if(this.cache.has(key))return this.cache.get(key);if(this.active>=2)return Promise.reject(Error('Voice busy'));this.active++;const task=this.make(text).finally(()=>this.active--);this.cache.set(key,task);while(this.cache.size>3)this.cache.delete(this.cache.keys().next().value);return task;}
}
