import {WinnerSpeaker,winnerText,questionText} from './speech.js';
const $=id=>document.getElementById(id), labels={text:'ĐOÁN ĐÁP ÁN',scramble:'SẮP XẾP CHỮ',choice:'CHỌN A · B · C · D',math:'TÍNH NHANH',riddle:'ĐỐ VUI',emoji:'NHÌN EMOJI ĐOÁN TỪ'};
let state=null,offset=0,roundKey='',boardKey='',lastEvent=0,retry=500,audio=null,received=false;
function fit(){const scale=Math.min(innerWidth/1080,innerHeight/1920);$('stage').style.transform=`scale(${scale})`;$('stage').style.left=`${Math.max(0,(innerWidth-1080*scale)/2)}px`;}
addEventListener('resize',fit);fit();
const mute=new URLSearchParams(location.search).get('audio')==='0';
const speaker=new WinnerSpeaker({muted:mute,status:text=>{$('voiceStatus').textContent=text;}});
let leaderKey='';
if(!mute){const b=document.createElement('button');b.className='audio-enable';b.textContent='Bật âm thanh & giọng đọc';b.style.cssText='position:absolute;bottom:16px;right:42px;background:#33234b;color:#d8c4ed;z-index:3';$('stage').append(b);b.onclick=async()=>{speaker.enable();readQuestion(state);try{audio=new AudioContext();await audio.resume();}catch{}b.remove();};}
function readQuestion(s){if(s?.phase==='question'&&!s.paused&&s.settings.speech)speaker.speak({key:`question:${s.round}`,round:s.round,kind:'question',text:questionText(s.question)});}
function ding(){if(!audio||!state?.settings.sound||mute)return;const at=audio.currentTime;for(const [i,f]of [660,880,1100].entries()){const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,at+i*.09);g.gain.linearRampToValueAtTime(.08,at+i*.09+.01);g.gain.exponentialRampToValueAtTime(.001,at+i*.09+.25);o.connect(g);g.connect(audio.destination);o.start(at+i*.09);o.stop(at+i*.09+.26);}}
function portrait(parent,p,cls='avatar'){const a=document.createElement('span');a.className=cls;if(p?.avatar&&/^https:\/\//.test(p.avatar)){const img=document.createElement('img');img.src=p.avatar;img.referrerPolicy='no-referrer';img.onerror=()=>{img.remove();a.textContent=p.name?.[0]||'★';};a.append(img);}else a.textContent=p?.name?.[0]||'★';parent.append(a);return a;}
function board(id,rows,key){const out=document.createDocumentFragment();if(!rows.length){const li=document.createElement('li');li.className='empty-board';li.textContent=key==='score'?'Chờ người mở điểm':'Chưa có quà tặng';out.append(li);}rows.forEach((p,i)=>{const li=document.createElement('li'),r=document.createElement('span'),n=document.createElement('span'),v=document.createElement('b');r.className='rank';r.textContent=i+1;li.append(r);portrait(li,p);n.className='player-name';n.textContent=p.name;v.className='player-value';v.textContent=Intl.NumberFormat('vi-VN').format(p[key]);li.append(n,v);out.append(li);});$(id).replaceChildren(out);}
function question(){const q=state.question;const key=JSON.stringify([state.round,state.phase,state.paused,state.winners,q]);if(key===roundKey)return;roundKey=key;
 $('questionCard').dataset.type=q?.type||'idle';$('questionCard').classList.toggle('is-winner',state.phase==='reveal'&&state.winners.length>0);
 const reveal=state.phase==='reveal';$('questionView').classList.toggle('hidden',reveal);$('winnerView').classList.toggle('hidden',!reveal);
 $('typeLabel').textContent=state.paused?'TẠM DỪNG':state.phase==='idle'?'AI SẼ NHANH NHẤT?':labels[q?.type]||'CÂU HỎI';
 if(reveal){const w=state.winners[0];$('winnerName').textContent=w?.name||'Hẹn bạn ở câu tiếp theo!';$('winnerAvatar').replaceChildren();if(w){const a=portrait($('winnerAvatar'),w);a.className='';a.style.cssText='width:100%;height:100%;display:grid;place-items:center';}else $('winnerAvatar').textContent='✦';$('solution').textContent=q.answer.toUpperCase();$('scoreChip').textContent=w?`+${w.points} điểm · Tổng ${w.score}${state.correctCount>1?` · ${state.correctCount} người đúng`:''}`:'Cùng khám phá câu hỏi mới';$('explanation').textContent=q.explanation||'';}
 else{$('prompt').textContent=state.phase==='idle'?'Sẵn sàng thử tài?':q?.prompt||'';$('prompt').style.fontSize=(q?.prompt?.length>350?28:q?.prompt?.length>180?34:q?.prompt?.length>90?42:50)+'px';$('answerSlots').replaceChildren();$('scrambleLabel').classList.add('hidden');$('letters').replaceChildren();$('options').replaceChildren();if(state.phase==='question'){
  if(!['choice','math'].includes(q.type)){
   const groups=q.letterGroups||(q.scrambled?[q.scrambled]:[]),count=groups.reduce((n,g)=>n+g.length,0);
   $('answerSlots').classList.toggle('compact-slots',count>24);
   $('letters').classList.toggle('compact-letters',count>24);
   $('scrambleLabel').classList.remove('hidden');
   $('letters').setAttribute('aria-label','Chữ cái đã xáo trộn');
   for(const letters of groups){
    const group=document.createElement('span');group.className='answer-word';group.setAttribute('aria-label',`${letters.length} ô trống`);
    for(let i=0;i<letters.length;i++){const slot=document.createElement('span');slot.className='answer-slot';slot.setAttribute('aria-hidden','true');group.append(slot);}
    $('answerSlots').append(group);
   }
   for(const letters of groups){const word=document.createElement('span');word.className='scrambled-word';word.setAttribute('aria-label',`${letters.length} chữ cái xáo trộn`);for(const c of letters){const tile=document.createElement('span');tile.className='letter';tile.textContent=c;word.append(tile);}$('letters').append(word);}

  }
  if(q.type==='choice')q.options.forEach((o,i)=>{const e=document.createElement('div'),b=document.createElement('b');e.className='option';b.textContent='ABCD'[i];e.append(b,document.createTextNode(o));$('options').append(e);});
 }$('answerHelp').textContent=state.phase==='idle'?'Bình luận đáp án để tham gia':q?.type==='choice'?'Bình luận A, B, C, D hoặc nội dung đáp án':(state.roundMode||state.settings.mode)==='all'?'Mọi đáp án đúng trong thời gian đều được điểm':`👉 Gõ đáp án vào bình luận · Nhanh nhất được điểm!${q?.letterGroups?' ('+q.letterGroups.flat().length+' chữ cái)':''}`;}
}
function render(s){const firstRender=!received;received=true;if(state&&(s.round!==state.round||s.phase!==state.phase||s.paused!==state.paused)){speaker.stop();$('voiceStatus').textContent='';}state=s;offset=s.serverTime-Date.now();$('liveTitle').textContent=s.settings.title;$('liveSubtitle').textContent=s.settings.subtitle;$('round').textContent=String(s.round).padStart(2,'0');$('category').textContent=s.question?.category||'Sẵn sàng chơi';$('playerCount').textContent=s.stats.players;
 $('connection').textContent=s.live.status==='connected'?`LIVE @${s.live.username}`:s.live.status==='connecting'?'Đang kết nối TikTok':'Chưa kết nối TikTok';question();
 const bk=JSON.stringify([s.topScores,s.topGifts]);if(bk!==boardKey){boardKey=bk;board('gifts',s.topGifts,'diamonds');board('scores',s.topScores,'score');}
 const leader=s.topScores[0],lk=leader?`${leader.id}:${leader.score}:${s.settings.points}`:'';
 if(lk!==leaderKey){leaderKey=lk;$('leaderName').textContent=leader?leader.name:'';$('leaderBadge').textContent=`Đúng +${s.settings.points} điểm`;$('leaderBadge').classList.toggle('hidden',!leader);}
 $('leaderTrack').classList.toggle('has-leader',!!leader);$('typeLabel').classList.toggle('hidden',!!leader);$('leaderTrack').classList.toggle('marquee-paused',s.paused||s.phase==='idle');
 $('ticker').textContent='Gõ đáp án vào bình luận để ghi điểm . Tặng quà để lên bảng vàng';
 if(s.event&&s.event.id!==lastEvent){lastEvent=s.event.id;if(!firstRender){ding();celebrate();}}
 readQuestion(s);
 const w=s.winners[0];
 if(s.phase==='reveal'&&w&&s.settings.speech){const key=`${s.round}:${w.id}`;if(firstRender)speaker.remember(key);else speaker.speak({key,round:s.round,text:winnerText(s.question.answer,w.name)});}
 if(!s.settings.speech||s.phase==='idle'){speaker.stop();$('voiceStatus').textContent='';}

}
function connect(){const ws=new WebSocket(`${location.protocol==='https:'?'wss':'ws'}://${location.host}/ws`);ws.onopen=()=>retry=500;ws.onmessage=e=>{try{const s=JSON.parse(e.data);if(s.t==='state')render(s);}catch{}};ws.onclose=()=>{$('connection').textContent='Mất máy chủ · đang nối lại';setTimeout(connect,retry);retry=Math.min(10000,retry*1.7);};}connect();
setInterval(()=>{if(!state)return;const now=Date.now()+offset;let left=0;if(state.phase==='question')left=state.paused?state.remaining:state.endsAt-now;else if(state.phase==='reveal'&&state.settings.auto)left=state.nextAt-now;$('timer').textContent=state.phase==='idle'?'—':state.paused?'Ⅱ':state.phase==='reveal'&&!state.settings.auto?'✓':`${Math.max(0,Math.ceil(left/1000))}s`;$('nextQuestion').textContent=state.phase==='reveal'?(state.settings.auto?`Chuẩn bị câu mới trong ${Math.max(0,Math.ceil(left/1000))} giây…`:'Sẵn sàng · Chờ người điều khiển chuyển câu'):'';const fraction=Math.max(0,Math.min(1,left/((state.phase==='reveal'?state.settings.breakTime:state.settings.duration)*1000)));$('timer').style.setProperty('--progress',`${fraction*100}%`);$('timeFill').style.width=`${Math.max(0,Math.min(100,left/((state.phase==='reveal'?state.settings.breakTime:state.settings.duration)*1000)*100))}%`;},100);
let animation=0;function celebrate(){if(animation||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const c=$('confetti');c.width=1080;c.height=1920;const ctx=c.getContext('2d'),pieces=Array.from({length:75},()=>({x:Math.random()*1080,y:-Math.random()*500,v:5+Math.random()*7,color:['#f9d776','#9c83ff','#64ebbc','#ed5b95'][Math.floor(Math.random()*4)]}));let frames=0;function frame(){ctx.clearRect(0,0,1080,1920);for(const p of pieces){p.y+=p.v;p.x+=Math.sin(p.y/60);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,7,13);}if(++frames<150)animation=requestAnimationFrame(frame);else{animation=0;ctx.clearRect(0,0,1080,1920);}}animation=requestAnimationFrame(frame);}
