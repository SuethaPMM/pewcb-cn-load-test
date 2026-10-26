(()=>{
 'use strict';
 const ready=()=>{
  const config=window.PEWCB_CN_SERVICES||{};
  const loader=document.querySelector('script[src*="assets/cn.js"]');
  const captionsBase=loader?new URL('./captions/',loader.src):null;
  const captionVideo=video=>{
   if(video.dataset.cnCaptioned||!captionsBase)return;
    if ((video.currentSrc||video.getAttribute('src')||'').includes('-zh-20261025')) { video.dataset.cnCaptioned='burned-in'; return; }
   const url=video.currentSrc||video.getAttribute('src')||'';
   const kind=url.includes('pewcb-desktop-web-')?'desktop':url.includes('pewcb-stencil-web-')?'stencils':url.includes('pewcb-bga-demo-')?'bga':null;
   if(!kind)return;
   video.dataset.cnCaptioned='true';
   const track=document.createElement('track');track.kind='subtitles';track.srclang='zh-CN';track.label='中文说明';track.src=new URL(kind+'.zh.vtt',captionsBase).href;track.default=true;video.append(track);
  };
  document.querySelectorAll('video').forEach(captionVideo);
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
   if(node.nodeType!==1)return;
   if(node.tagName==='VIDEO')captionVideo(node);else node.querySelectorAll?.('video').forEach(captionVideo);
  }))).observe(document.body,{childList:true,subtree:true});
  const safeURL=value=>typeof value==='string'&&/^https:\/\/[^\s<>"']+$/i.test(value)?value:'';
  let qrDialog;
  const showQR=()=>{
   const value=config.wechatQr;
   if(typeof value!=='string'||!value||(!safeURL(value)&&!/^assets\/[\w./-]+\.(?:png|webp|jpe?g)$/i.test(value)))return false;
   if(!qrDialog){
    qrDialog=document.createElement('dialog');qrDialog.className='cn-qr-dialog';
    const title=document.createElement('h2');title.textContent='微信联系';
    const image=document.createElement('img');image.alt='PewCB 微信联系二维码';
    image.src=safeURL(value)||new URL(value,document.querySelector('script[src*="cn-services.js"]').src.replace(/assets\/cn-services\.js.*$/,'')).href;
    const close=document.createElement('button');close.type='button';close.textContent='关闭';close.addEventListener('click',()=>qrDialog.close());
    qrDialog.append(title,image,close);document.body.append(qrDialog);
    qrDialog.addEventListener('click',event=>{if(event.target===qrDialog){const r=qrDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)qrDialog.close()}});
   }
   if(typeof qrDialog.showModal!=='function')return false;
   qrDialog.showModal();return true;
  };
  document.querySelectorAll('[data-cn-channel]').forEach(link=>{
   const channel=link.dataset.cnChannel,url=safeURL(config[channel]);
   if(url){link.href=url;link.target='_blank';link.rel='noopener';}
   else if(channel==='wechat')link.addEventListener('click',event=>{
    if(showQR()){event.preventDefault();return;}
    const field=document.getElementById('contact-question');
    if(field&&!field.value)field.value='请通过微信联系我。微信号：';
   });
  });
  document.querySelectorAll('[data-contact-subject]').forEach(link=>link.addEventListener('click',()=>{
   const field=document.getElementById('contact-question');
   if(field&&!field.value)field.value=link.dataset.contactSubject;
  }));
  const states=new WeakMap();
  const formStatus=form=>{
   let status=form.querySelector('.cn-form-status');
   if(!status){status=document.createElement('p');status.className='cn-form-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');form.append(status);}
   return status;
  };
  document.querySelectorAll('form[data-cn-lead]').forEach(form=>{
   if(!form.querySelector('[name=website]')){const trap=document.createElement('input');trap.type='text';trap.name='website';trap.tabIndex=-1;trap.autocomplete='off';trap.setAttribute('aria-hidden','true');trap.style.cssText='position:absolute;left:-10000px;width:1px;height:1px;opacity:0;pointer-events:none';form.append(trap);}const old=form.querySelector('.js-successbox');if(old)old.hidden=true;
   form.querySelectorAll('input,textarea,select').forEach(field=>{
    field.addEventListener('input',()=>field.setCustomValidity(''));
    field.addEventListener('invalid',()=>field.setCustomValidity(field.validity.typeMismatch?'请输入有效的电子邮箱。':field.type==='checkbox'?(field.name==='cross_border_consent'?'请单独确认境外传输说明。':'请阅读并同意个人信息处理政策。'):field.tagName==='SELECT'?'请选择联系方式。':'请填写此项。'));
   });
  });
  document.addEventListener('submit',async event=>{
   const form=event.target;if(!(form instanceof HTMLFormElement)||!form.matches('[data-cn-lead]'))return;
   event.preventDefault();event.stopImmediatePropagation();
   const previous=states.get(form)||{};if(previous.busy||previous.sent||!form.reportValidity())return;
   const status=formStatus(form),submit=form.querySelector('[type="submit"]');
   const values={};new FormData(form).forEach((value,key)=>{values[key]=String(value).trim()});
   const email=values.email||values.Email||'';
   const name=values.name||values.Name||'';
   // The labelled submit button expresses processing consent; the checkbox is for overseas transfer only.
   const consent=true;
   const cross_border_consent=form.elements.cross_border_consent?.checked===true;
   const privacy_version=form.elements.privacy_version?.value||'';
   const method=form.querySelector('select')?.value||'';
   const handle=form.querySelector('input[name="contact"],input[name="contact_details"],input[name="Username"],input[name="profile"]')?.value||'';
   const details=[values.Textarea||values.message||form.querySelector('textarea')?.value||'',values.phone?'电话：'+values.phone:'',method?'联系方式：'+method:'',handle?'联系账号：'+handle:''];
   // Retain every user-entered contact field even when legacy Tilda field names differ.
   for(const [key,value]of Object.entries(values))if(value&&!['name','Name','email','Email','phone','company','Company','Textarea','message','Checkbox','consent','cross_border_consent','discord_notification_consent','privacy_version','website','contact','contact_details','Username','profile'].includes(key)&&!key.startsWith('formservices')&&!key.startsWith('tilda'))details.push(key+'：'+value);
   const fingerprint=JSON.stringify(values);
   let id=previous.fingerprint===fingerprint?previous.id:'';
   if(!id){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);id=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');}
   const state={busy:true,sent:false,id,fingerprint};states.set(form,state);
   const originalLabel=submit.textContent;submit.disabled=true;submit.textContent='正在发送…';form.setAttribute('aria-busy','true');status.textContent='';status.removeAttribute('data-error');
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
   const errorMessage='未能确认提交结果，请重试或联系 welcome@pewcb.com。';
   try{
    if(location.protocol==='file:')throw new Error('请在已部署的网站上提交咨询，或直接联系 welcome@pewcb.com。');
    const options={credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json','X-PewCB-Store':'1'},signal:controller.signal};
    const read=async response=>{if(!(response.headers.get('Content-Type')||'').includes('application/json'))throw new Error(errorMessage);const body=await response.json();if(!response.ok||body.ok!==true)throw new Error(body.message||errorMessage);return body;};
    const endpoint=form.getAttribute('action');const token=await fetch(endpoint+'?action=token',options).then(read);
    if(typeof token.token!=='string'||token.token.length<64)throw new Error(errorMessage);
    const payload={product:form.dataset.cnLead==='device'?'device':'contact',quantity:1,name,email,company:values.company||values.Company||'',country:values.country||'',message:details.filter(Boolean).join('\n'),website:values.website||'',consent,processing_consent_method:'submit_button',cross_border_consent,privacy_version,request_id:id,csrf_token:token.token};
    const result=await fetch(endpoint,{...options,method:'POST',headers:{...options.headers,'Content-Type':'application/json'},body:JSON.stringify(payload)}).then(read);
    state.sent=true;status.textContent=result.message;submit.textContent='已提交';
   }catch(error){status.dataset.error='true';status.textContent=error.name==='AbortError'?errorMessage:error.message||errorMessage;submit.disabled=false;submit.textContent=originalLabel;}
   finally{clearTimeout(timer);state.busy=false;form.removeAttribute('aria-busy');}
  },true);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
