// No password/cookie/session is requested. This connector reads public LIVE events.
export class LiveLink {
 constructor(game,changed){this.game=game;this.changed=changed;this.state={status:'idle'};this.generation=0;this.gifts=new Map();}
 async connect(username){
  username=String(username||'').trim().replace(/^@/,'');if(!/^[\w.]{2,32}$/.test(username))throw Error('Nhập tên kênh TikTok hợp lệ, không phải đường link.');
  await this.disconnect(); const gen=++this.generation;this.state={status:'connecting',username};this.changed();
  try{
   const {TikTokLiveConnection,WebcastPushConnection}=await import('tiktok-live-connector');const C=TikTokLiveConnection||WebcastPushConnection;
   const c=new C(username,{enableExtendedGiftInfo:true,processInitialData:false});this.client=c;
   c.on('chat',e=>{if(gen!==this.generation)return;this.game.comment({id:String(e.userId||e.uniqueId),name:e.nickname||e.uniqueId,avatar:e.profilePictureUrl,text:e.comment,msgId:e.msgId&&String(e.msgId)});});
   c.on('gift',e=>{if(gen!==this.generation)return;const count=Number(e.repeatCount)||1,unit=Number(e.diamondCount)||0;
    // Streaks are scored only on final event, keyed by groupId to prevent replay.
    if(e.giftType===1&&!e.repeatEnd)return;
    const key=String(e.groupId||e.msgId||`${e.userId}:${e.giftId}:${e.createTime||Date.now()}`);if(this.gifts.has(key))return;
    this.gifts.set(key,1);if(this.gifts.size>10000)this.gifts.delete(this.gifts.keys().next().value);
    this.game.gift({id:String(e.userId||e.uniqueId),name:e.nickname||e.uniqueId,avatar:e.profilePictureUrl,diamonds:count*unit});
   });
   c.on('disconnected',()=>{if(gen===this.generation){this.state={status:'disconnected',username,error:'Mất kết nối. Bấm Kết nối lại.'};this.changed();}});
   c.on('error',()=>{if(gen===this.generation){this.state={...this.state,error:'Lỗi kết nối TikTok. Kiểm tra kênh đang LIVE và thử lại.'};this.changed();}});
   await c.connect();if(gen!==this.generation){await c.disconnect();return;}this.state={status:'connected',username};this.changed();
  }catch{if(gen===this.generation){this.state={status:'error',username,error:'Không kết nối được. Kênh phải đang LIVE; dịch vụ TikTok có thể giới hạn truy cập.'};this.changed();}}
 }
 async disconnect(){++this.generation;const c=this.client;this.client=null;try{await c?.disconnect();}catch{}this.state={status:'idle'};this.changed();}
}
