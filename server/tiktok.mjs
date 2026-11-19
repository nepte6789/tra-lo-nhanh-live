// No password/cookie/session is requested. This connector reads public LIVE events.
export function eventUser(e){
 const u=e.user||e;const id=u.userId||u.idStr||u.id||u.uniqueId||u.displayId;
 if(id===undefined||id===null||String(id)==='')return null;
 return {id:String(id),name:u.nickname||u.uniqueId||u.displayId||'Người xem',avatar:u.profilePictureUrl||u.avatarLarge?.urlList?.[0]||u.avatarThumb?.urlList?.[0]||''};
}
export function chatData(e){const u=eventUser(e);if(!u)return null;const mid=e.msgId||e.common?.msgId;const rawTime=Number(e.common?.createTime??e.createTime);const sentAt=Number.isFinite(rawTime)&&rawTime>0?(rawTime<1e12?rawTime*1000:rawTime):undefined;return {...u,text:e.comment,msgId:mid&&String(mid)!=='0'?String(mid):undefined,sentAt,timePrecision:rawTime<1e12?1000:1};}
export function giftData(e){const u=eventUser(e);if(!u)return null;const details=e.giftDetails||e.extendedGiftInfo||{};
 const type=Number(details.giftType??e.giftType??e.gift?.gift_type);if(type===1&&!e.repeatEnd)return null;
 const diamonds=Number(details.diamondCount??details.diamond_count??e.diamondCount??0)*(Number(e.repeatCount)||1);
 const group=e.groupId&&String(e.groupId)!=='0'?String(e.groupId):null,mid=e.msgId||e.common?.msgId;
 return {...u,diamonds,key:group?`${u.id}:${e.giftId}:${group}`:mid&&String(mid)!=='0'?String(mid):null};
}
export class LiveLink {
 constructor(game,changed,{createClient}={}){this.createClient=createClient;this.game=game;this.changed=changed;this.state={status:'idle'};this.generation=0;this.gifts=new Map();}
 async connect(username){
  username=String(username||'').trim().replace(/^@/,'');if(!/^[\w.]{2,32}$/.test(username))throw Error('Nhập tên kênh TikTok hợp lệ, không phải đường link.');
  await this.disconnect(); const gen=++this.generation;this.game.setLive(true);this.state={status:'connecting',username};this.changed();
  try{
   const options={enableExtendedGiftInfo:true,processInitialData:false};
   let c;if(this.createClient)c=await this.createClient(username,options);else{const {TikTokLiveConnection}=await import('tiktok-live-connector');c=new TikTokLiveConnection(username,options);}
   if(gen!==this.generation){await c.disconnect();return;}this.client=c;
   c.on('chat',e=>{if(gen!==this.generation||this.state.status!=='connected')return;const data=chatData(e);if(data&&this.game.comment(data))this.changed('winner');});
   c.on('gift',e=>{if(gen!==this.generation||this.state.status!=='connected')return;const data=giftData(e);if(!data)return;
    if(data.key){if(this.gifts.has(data.key))return;this.gifts.set(data.key,1);if(this.gifts.size>10000)this.gifts.delete(this.gifts.keys().next().value);}
    this.game.gift(data);
   });
   c.on('disconnected',()=>{if(gen===this.generation){this.game.setLive(false);this.state={status:'disconnected',username,error:'Mất kết nối. Bấm Kết nối lại.'};this.changed();}});
   c.on('error',()=>{if(gen===this.generation){this.state={...this.state,error:'Lỗi kết nối TikTok. Kiểm tra kênh đang LIVE và thử lại.'};this.changed();}});
   await c.connect();if(gen!==this.generation){await c.disconnect();return;}this.state={status:'connected',username};this.changed();
  }catch{if(gen===this.generation){this.game.setLive(false);this.state={status:'error',username,error:'Không kết nối được. Kênh phải đang LIVE; dịch vụ TikTok có thể giới hạn truy cập.'};this.changed();}}
 }
 async disconnect(){this.game.setLive(false);++this.generation;const c=this.client;this.client=null;try{await c?.disconnect();}catch{}this.state={status:'idle'};this.changed();}
}
