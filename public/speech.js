export function winnerText(answer,name){const tidy=(s,n)=>String(s||'').normalize('NFC').replace(/[^\p{L}\p{N}\s.,-]/gu,' ').replace(/\s+/g,' ').trim().slice(0,n);return `Đáp án là ${tidy(answer,100)}. ${tidy(name,45)||'Người chơi'} trả lời đúng.`;}
export class WinnerSpeaker {
 constructor({synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,fetcher=globalThis.fetch,makeAudio=()=>new Audio(),urlApi=globalThis.URL,status=()=>{},muted=false}={}){Object.assign(this,{synth,Utterance,fetcher,makeAudio,urlApi,status,muted});this.enabled=false;this.seen=new Set();this.seq=0;}
 remember(key){this.seen.add(key);if(this.seen.size>50)this.seen.delete(this.seen.values().next().value);}
 enable(){this.enabled=true;this.synth?.getVoices();}
 stop(){this.seq++;this.abort?.abort();try{this.synth?.cancel();this.audio?.pause();}catch{}if(this.objectUrl)this.urlApi.revokeObjectURL(this.objectUrl);this.objectUrl=null;this.audio=null;}
 async speak({key,text,round}){
  if(this.muted||!this.enabled||this.seen.has(key))return;this.remember(key);this.stop();const seq=this.seq;
  const voice=this.synth?.getVoices().find(v=>/^vi(?:-|_)/i.test(v.lang));
  if(voice&&this.Utterance){const line=new this.Utterance(text);line.lang='vi-VN';line.voice=voice;line.rate=1.1;line.onend=()=>{if(seq===this.seq)this.status('');};line.onerror=()=>{if(seq===this.seq)this.remote(round,seq);};this.status('Đang đọc đáp án và người thắng…');try{this.synth.speak(line);}catch{await this.remote(round,seq);}return;}
  await this.remote(round,seq);
 }
 async remote(round,seq){
  const controller=new AbortController();this.abort=controller;const timer=setTimeout(()=>controller.abort(),5500);this.status('Đang chuẩn bị giọng đọc tiếng Việt…');
  try{const r=await this.fetcher(`/api/winner-voice?round=${encodeURIComponent(round)}`,{signal:controller.signal});if(!r.ok)throw Error('Voice unavailable');const blob=await r.blob();if(seq!==this.seq)return;this.objectUrl=this.urlApi.createObjectURL(blob);const a=this.makeAudio();this.audio=a;a.src=this.objectUrl;a.onended=()=>{if(seq===this.seq){this.status('');this.urlApi.revokeObjectURL(this.objectUrl);this.objectUrl=null;}};a.onerror=()=>{if(seq===this.seq)this.status('Không phát được giọng đọc. Kiểm tra âm thanh nguồn LIVE.');};await a.play();if(seq===this.seq)this.status('Đang đọc đáp án và người thắng…');}
  catch(e){if(seq===this.seq&&e.name!=='AbortError')this.status('Giọng đọc chưa sẵn sàng. Kiểm tra mạng hoặc cài giọng tiếng Việt trên máy.');else if(seq===this.seq)this.status('Giọng đọc phản hồi chậm. Kiểm tra kết nối mạng.');}
  finally{clearTimeout(timer);}
 }
}
