(()=>{
 'use strict';
 const init=()=>{
  document.querySelectorAll('[data-pewcb-video]').forEach(container=>{
   if(container.dataset.playerReady)return;
   const button=container.querySelector('.pewcb-video__play');
   const source=container.dataset.pewcbVideo;
   if(!button||!source)return;
   container.dataset.playerReady='true';
   button.addEventListener('click',()=>{
    const poster=container.querySelector('img');
    const video=document.createElement('video');
    video.className='pewcb-video__player';video.controls=true;video.playsInline=true;video.preload='none';
    video.poster=poster.currentSrc||poster.src;
    video.setAttribute('aria-label',container.getAttribute('aria-label')||"PewCB 演示视频");
    video.addEventListener('play',()=>{
     document.querySelectorAll('video').forEach(other=>{if(other!==video&&!other.muted)other.pause()});
    });
    // Assigning the media source only inside the click handler avoids background downloads.
    video.src=source;
    container.replaceChildren(video);
    video.focus({preventScroll:true});
    video.play().catch(()=>{});
    if('IntersectionObserver'in window){
     const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)video.pause()}),{threshold:.05});
     observer.observe(container);
    }
    document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause()});
   },{once:true});
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
