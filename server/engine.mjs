import { randomInt } from 'node:crypto';
export const normalize = x => String(x ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9]/g,'');
const clean = (x,n=60) => String(x??'').replace(/[\u0000-\u001f\u007f]/g,'').slice(0,n);
export function validateBank(items) {
  if (!Array.isArray(items) || !items.length || items.length > 50000) throw Error('Bộ câu hỏi cần có từ 1 đến 50.000 câu.');
  const ids=new Set();
  return items.map((q,i)=>{
    if (!q || typeof q !== 'object' || typeof q.prompt !== 'string' || typeof q.answer !== 'string') throw Error(`Câu ${i+1}: thiếu prompt hoặc answer.`);
    const id=clean(q.id || `import-${i+1}`,80), type=q.type||'text';
    if(ids.has(id)) throw Error(`Trùng mã câu ${id}`); ids.add(id);
    if(!['text','scramble','choice','math','riddle','emoji'].includes(type)) throw Error(`Câu ${i+1}: loại không hợp lệ.`);
    if(!normalize(q.answer) || q.prompt.length>500 || q.answer.length>100) throw Error(`Câu ${i+1}: nội dung không hợp lệ.`);
    if(q.aliases && (!Array.isArray(q.aliases)||q.aliases.length>20||q.aliases.some(a=>typeof a!=='string'||!normalize(a)||a.length>100))) throw Error(`Câu ${i+1}: aliases không hợp lệ.`);
    const options=q.options;
    if(type==='choice' && (!Array.isArray(options)||options.length!==4||options.some(o=>typeof o!=='string'||!o.trim()||o.length>150)||!options.some(o=>normalize(o)===normalize(q.answer)))) throw Error(`Câu ${i+1}: cần 4 lựa chọn có đáp án đúng.`);
    return {id,category:clean(q.category||'Tự thêm',60),type,prompt:clean(q.prompt,500),answer:q.answer.trim(),aliases:q.aliases||[],...(options?{options}:{}),...(q.explanation?{explanation:clean(q.explanation,400)}:{})};
  });
}
const graphemes = new Intl.Segmenter('vi', {granularity:'grapheme'});
export function scrambleAnswer(answer, pick=randomInt) {
 const words=String(answer).normalize('NFC').trim().toLocaleUpperCase('vi').split(/\s+/u).filter(Boolean).map(w=>Array.from(graphemes.segment(w),x=>x.segment));
 const original=words.flat(), shuffled=original.slice();
 for(let i=shuffled.length-1;i>0;i--){const j=pick(i+1);[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 // A shuffle can return the original order. Change it when distinct letters exist.
 if(shuffled.every((c,i)=>c===original[i])){const j=shuffled.findIndex(c=>c!==shuffled[0]);if(j>0)[shuffled[0],shuffled[j]]=[shuffled[j],shuffled[0]];}
 let offset=0;return words.map(word=>{const group=shuffled.slice(offset,offset+word.length);offset+=word.length;return group;});
}
export class Game {
 constructor(bank,{now=Date.now,saved={}}={}) {
  this.bank=validateBank(bank); this.now=now; this.settings={title:'TRẢ LỜI NHANH',subtitle:'Nhanh trí • Vui mỗi ngày',duration:25,breakTime:3,mode:'first',points:1,auto:true,category:'all',type:'all',sound:true,...saved.settings};
  this.players=new Map((saved.players||[]).map(p=>[p.id,p])); this.phase='idle';this.round=0;this.deck=[];this.current=null;this.version=0;this.totalComments=0;this.accepted=0;this.scoreOrder=[...this.players.values()].reduce((n,p)=>Math.max(n,p.order||0),0);this.rate=new Map();this.seen=new Map();this.lastEvent=null;this.winners=[];this.giftRevision=0;
 }
 configure(p) {
  if(this.live && p.mode && p.mode!=='first')throw Error('LIVE thật chỉ ghi nhận người đúng đầu tiên.');
  const s=this.settings;
  for(const k of ['title','subtitle']) if(typeof p[k]==='string') s[k]=clean(p[k],70);
  for(const [k,min,max] of [['duration',5,300],['breakTime',1,20],['points',1,100]]) if(p[k]!==undefined){const v=Number(p[k]);if(!Number.isFinite(v))throw Error('Thiết lập số không hợp lệ');s[k]=Math.min(max,Math.max(min,Math.round(v)));}
  if(p.mode && ['first','all'].includes(p.mode))s.mode=p.mode;
  for(const k of ['auto','sound'])if(typeof p[k]==='boolean')s[k]=p[k];
  for(const k of ['category','type'])if(typeof p[k]==='string'&&p[k]!==s[k]){if(p[k]!=='all'&&!this.bank.some(q=>q[k]===p[k]))throw Error('Không tìm thấy bộ hoặc loại câu hỏi');s[k]=p[k];this.deck=[];}
  this.version++;
 }
 next() {
  const eligible=this.bank.filter(q=>(this.settings.category==='all'||q.category===this.settings.category)&&(this.settings.type==='all'||q.type===this.settings.type));
  if(!eligible.length)throw Error('Không có câu phù hợp. Hãy chọn lại bộ hoặc loại câu hỏi.');
  if(!this.deck.length){this.deck=eligible.slice();for(let i=this.deck.length-1;i>0;i--){const j=randomInt(i+1);[this.deck[i],this.deck[j]]=[this.deck[j],this.deck[i]];}}
  this.current=this.deck.pop();this.round++;this.phase='question';this.roundMode=this.live?'first':this.settings.mode;this.roundPoints=this.settings.points;this.startedAt=this.now();this.endsAt=this.startedAt+this.settings.duration*1000;this.correct=new Set();this.winners=[];this.rate.clear();this.paused=false;this.lastEvent=null;
  this.letterGroups=scrambleAnswer(this.current.answer);this.scrambled=this.letterGroups.flat();
  this.answers=new Set([this.current.answer,...this.current.aliases].map(normalize));
  if(this.current.type==='choice'){const ix=this.current.options.findIndex(o=>normalize(o)===normalize(this.current.answer));this.answers.add('abcd'[ix]);}
  this.version++;return this.current;
 }
 reveal(reason='manual'){if(this.phase!=='question')return;this.phase='reveal';this.paused=false;this.nextAt=this.now()+this.settings.breakTime*1000;this.reason=reason;this.version++;}
 pause(){if(this.phase==='question'&&!this.paused){this.remaining=Math.max(0,this.endsAt-this.now());this.paused=true;this.version++;}else if(this.paused){this.endsAt=this.now()+this.remaining;this.paused=false;this.version++;}}
 stop(){this.phase='idle';this.paused=false;this.version++;}
 tick(){if(this.paused)return;if(this.phase==='question'&&this.now()>=this.endsAt)this.reveal('timeout');else if(this.phase==='reveal'&&this.settings.auto&&this.now()>=this.nextAt){try{this.next();}catch{this.stop();}}}
 player(id,name,avatar=''){let p=this.players.get(id);if(!p){if(this.players.size>=100000)return null;p={id,name:clean(name),avatar:'',score:0,diamonds:0,correct:0,order:0};this.players.set(id,p);}p.name=clean(name)||p.name;if(typeof avatar==='string'&&/^https:\/\//.test(avatar)&&avatar.length<1000)p.avatar=avatar;return p;}
 setLive(active){this.live=active;if(active){for(const id of this.players.keys())if(id.startsWith('demo:'))this.players.delete(id);this.stop();this.winners=[];this.lastEvent=null;this.correct=new Set();this.configure({mode:'first'});}}
 comment({id,name,text,msgId,avatar,round,sentAt,timePrecision=1}){
  if(typeof id!=='string'||!id||id.length>150||typeof text!=='string'||text.length>500)return false;
  this.totalComments++;
  if(msgId){msgId=String(msgId).slice(0,200);if(this.seen.has(msgId))return false;this.seen.set(msgId,1);if(this.seen.size>50000)this.seen.delete(this.seen.keys().next().value);}
  if(this.phase!=='question'||this.paused||(round!==undefined&&round!==this.round))return false;
  if(this.now()>=this.endsAt){this.reveal('timeout');return false;}
  if(Number.isFinite(sentAt)&&sentAt<Math.floor(this.startedAt/(timePrecision===1000?1000:1))*(timePrecision===1000?1000:1))return false;
  if(this.correct.has(id))return false;
  if(!this.answers.has(normalize(text)))return false;
  const p=this.player(id,name,avatar);if(!p)return false;
  this.correct.add(id);p.score+=this.roundPoints;p.correct++;p.order=++this.scoreOrder;this.accepted++;
  const w={id:p.id,name:p.name,avatar:p.avatar,score:p.score,points:this.roundPoints};if(this.winners.length<20)this.winners.push(w);
  this.lastEvent={id:++this.version,kind:'correct',name:p.name,answer:this.current.answer,points:this.roundPoints};
  if(this.roundMode==='first')this.reveal('winner');return true;
 }
 gift({id,name,avatar,diamonds}){if(typeof id!=='string'||!id||id.length>150||!Number.isFinite(diamonds)||diamonds<=0||diamonds>1e9)return false;const p=this.player(id,name,avatar);if(!p)return false;p.diamonds+=diamonds;this.giftRevision++;this.version++;return true;}
 top(key){return [...this.players.values()].filter(p=>p[key]>0).sort((a,b)=>b[key]-a[key]||a.order-b.order||a.id.localeCompare(b.id)).slice(0,10).map(p=>({id:p.id,name:p.name,avatar:p.avatar,score:p.score,diamonds:p.diamonds}));}
 snapshot(){const q=this.current;return {version:this.version,serverTime:this.now(),phase:this.phase,paused:!!this.paused,round:this.round,endsAt:this.endsAt,nextAt:this.nextAt,remaining:this.remaining,settings:this.settings,roundMode:this.roundMode,question:q?{id:q.id,prompt:q.prompt,type:q.type,category:q.category,options:q.options,scrambled:!['choice','math'].includes(q.type)?this.scrambled:undefined,letterGroups:!['choice','math'].includes(q.type)?this.letterGroups:undefined,length:this.scrambled.length,...(this.phase==='reveal'?{answer:q.answer,explanation:q.explanation}: {})}:null,winners:this.winners,correctCount:this.correct?.size||0,event:this.lastEvent,topScores:this.top('score'),topGifts:this.top('diamonds'),stats:{players:this.players.size,comments:this.totalComments,accepted:this.accepted}};}
 export(){return {settings:this.settings,players:[...this.players.values()]};}
 reset(){this.players.clear();this.scoreOrder=0;this.accepted=0;this.totalComments=0;this.stop();}
 replaceBank(items){const bank=validateBank(items);this.bank=bank;this.deck=[];this.settings.category='all';this.settings.type='all';this.stop();}
}
