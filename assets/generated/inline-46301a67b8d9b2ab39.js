(()=>{
'use strict';
const PRODUCTS=Object.freeze({
 'blanks-53-20':Object.freeze({name:"53 × 53 mm 基板",price:"7 美元起 / 片",pack:20,category:'blanks'}),
 'stencils-53-20':Object.freeze({name:"53 × 53 mm 基板配套锡箔模板片",price:"1 美元起 / 张",pack:20,category:'stencils'}),
 filters:Object.freeze({name:"替换过滤耗材",price:"价格待公布",pack:1,category:'filters'})
});
const exclusions="价格不含运费、进口关税及当地税费。 预计交期：最长 60 天。";
function product(id){return Object.prototype.hasOwnProperty.call(PRODUCTS,id)?PRODUCTS[id]:null}
function quantity(value){const n=Number(value);return String(value).trim()!==''&&Number.isInteger(n)&&n>=1&&n<=500?n:null}
function requestData(id,fields,requestId){
 if(!product(id)||quantity(fields.quantity)===null)throw new Error("产品或数量无效");
 return {product:id,quantity:quantity(fields.quantity),name:String(fields.name||'').trim(),email:String(fields.email||'').trim(),company:String(fields.company||'').trim(),country:String(fields.country||'').trim(),message:String(fields.message||'').trim(),consent:fields.consent===true,cross_border_consent:fields.cross_border_consent===true,discord_notification_consent:fields.discord_notification_consent===true,privacy_version:String(fields.privacy_version||''),website:String(fields.website||''),request_id:requestId};
}
if(typeof module!=='undefined'&&module.exports)module.exports={PRODUCTS,product,quantity,requestData,exclusions};
if(typeof document==='undefined')return;
const init=()=>{
 const categories=[...document.querySelectorAll('[data-store-category]')];
 const panels=[...document.querySelectorAll('[data-store-panel]')];
 const surface=document.querySelector('[data-store-surface]');
 const dialog=document.querySelector('#product-request');
 const form=dialog.querySelector('form');
 const status=dialog.querySelector('[data-order-status]');
 const submit=form.querySelector('[type=submit]');
 const quantityInput=form.elements.quantity;
 const quantityLabel=dialog.querySelector('[data-quantity-label]');
 const quantityNote=dialog.querySelector('[data-quantity-note]');
 let selected=null,opener=null,submitting=false,sent=false,requestId='',fingerprint='',scrollBefore='';
 function showCategory(category,updateHash=false){
  const exists=category==='blanks'||category==='stencils';
  categories.forEach(button=>button.setAttribute('aria-expanded',String(button.dataset.storeCategory===category)));
  panels.forEach(panel=>{panel.hidden=panel.dataset.storePanel!==category});
  surface.dataset.empty=String(!exists);surface.hidden=!exists;
  if(updateHash)history.replaceState(null,'','#'+category);
 }
 function fromHash(){const category=location.hash.slice(1);showCategory(['blanks','stencils'].includes(category)?category:'blanks')}
 categories.forEach(button=>button.addEventListener('click',()=>showCategory(button.dataset.storeCategory,true)));
 window.addEventListener('hashchange',fromHash);fromHash();
 function updateQuantity(){
  const n=quantity(quantityInput.value),p=product(selected);
  quantityNote.textContent=n&&p?(p.pack===20?`${n} 包 · ${n*20} ${p.category==='blanks'?'片':'张'}`:`数量：${n}`):"请输入 1 至 500 之间的整数。";
 }
 function openRequest(id,trigger){
  if(!product(id))return;
  selected=id;opener=trigger;sent=false;requestId='';fingerprint='';form.reset();
  form.hidden=false;submit.disabled=false;submit.textContent="提交咨询";status.textContent='';status.removeAttribute('data-error');
  const p=product(id),source=document.querySelector(`[data-product-image="${id}"]`);
  const image=dialog.querySelector('[data-order-image]');image.src=source.src;image.alt=source.alt;
  dialog.querySelector('[data-order-name]').textContent=p.name;
  dialog.querySelector('[data-order-price]').textContent=p.price+(p.pack===20?" · 每包 20 "+(id.includes("stencil")?"张":"片"):'');
  form.elements.product.value=id;quantityLabel.textContent=p.pack===20?"数量（包，每包 20 "+(id.includes("stencil")?"张":"片")+"）":"数量";updateQuantity();
  if(typeof dialog.showModal!=='function'){location.href='../index.html#contacts';return}
  scrollBefore=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();
 }
 document.querySelectorAll('[data-request-product]').forEach(button=>button.addEventListener('click',()=>openRequest(button.dataset.requestProduct,button)));
 function close(){if(!submitting)dialog.close()}
 dialog.querySelector('[data-order-close]').addEventListener('click',close);
 dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close()}});
 dialog.addEventListener('cancel',event=>{if(submitting)event.preventDefault()});
 dialog.addEventListener('close',()=>{document.body.style.overflow=scrollBefore;if(opener&&opener.isConnected)opener.focus()});
 quantityInput.addEventListener('input',updateQuantity);
 const endpoint=form.getAttribute('action');
 const errorText="未能确认提交结果，请重试或联系 welcome@pewcb.com。";
 async function responseJSON(response){
  const type=response.headers.get('Content-Type')||'';
  if(!type.toLowerCase().includes('application/json'))throw new Error(errorText);
  const body=await response.json();
  if(!response.ok||body.ok!==true)throw new Error(typeof body.message==='string'?body.message:errorText);
  return body;
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(submitting||sent||!form.reportValidity())return;
  if(location.protocol==='file:'){status.textContent="请在已部署的网站上提交咨询，或直接联系 welcome@pewcb.com。";status.dataset.error='true';return}
  const values={};new FormData(form).forEach((v,k)=>{values[k]=v});values.consent=form.elements.consent.checked;values.cross_border_consent=form.elements.cross_border_consent.checked;values.discord_notification_consent=form.elements.discord_notification_consent.checked;
  const nextFingerprint=JSON.stringify(values);
  if(nextFingerprint!==fingerprint){fingerprint=nextFingerprint;const random=new Uint8Array(16);crypto.getRandomValues(random);requestId=Array.from(random,b=>b.toString(16).padStart(2,'0')).join('')}
  const payload=requestData(selected,values,requestId);
  submitting=true;submit.disabled=true;submit.textContent="正在发送…";status.textContent='';status.removeAttribute('data-error');form.setAttribute('aria-busy','true');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  const options={credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json','X-PewCB-Store':'1'},signal:controller.signal};
  try{
   const token=await fetch(endpoint+'?action=token',options).then(responseJSON);
   if(typeof token.token!=='string'||token.token.length<64)throw new Error(errorText);
   const result=await fetch(endpoint,{...options,method:'POST',headers:{...options.headers,'Content-Type':'application/json'},body:JSON.stringify({...payload,csrf_token:token.token})}).then(responseJSON);
   sent=true;form.hidden=true;status.textContent=result.message;
  }catch(error){status.textContent=error.name==='AbortError'?errorText:(error.message||errorText);status.dataset.error='true';submit.textContent="提交咨询";submit.disabled=false}
  finally{clearTimeout(timer);submitting=false;form.removeAttribute('aria-busy')}
 });
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
