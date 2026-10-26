(()=>{
 'use strict';
 const dialog=document.getElementById('image-dialog'),image=document.getElementById('image-dialog-photo');
 let previousFocus;
 if(dialog&&image){
  document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{
   previousFocus=button;image.src=button.dataset.photo;image.alt=button.querySelector('img')?.alt||'';
   document.getElementById('image-dialog-caption').textContent=button.dataset.caption||'';
   dialog.showModal();
  }));
  dialog.querySelector('.image-dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>previousFocus?.focus({preventScroll:true}));
 }
 document.querySelectorAll('[data-video]').forEach(container=>{
  const button=container.querySelector('.video-play');
  if(!button)return;
  button.addEventListener('click',()=>{
   const video=document.createElement('video');
   video.controls=true;video.playsInline=true;video.preload='metadata';video.poster=container.querySelector('img')?.src||'';video.src=container.dataset.video;
   container.replaceChildren(video);video.focus();
   video.play().catch(()=>{});
   if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)video.pause();},{threshold:0.05});observer.observe(video);}
  },{once:true});
 });
})();
