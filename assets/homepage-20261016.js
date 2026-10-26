(()=>{
 'use strict';
 const init=()=>{
  document.querySelectorAll('[data-contact-subject]').forEach(a=>a.addEventListener('click',()=>{
   const input=document.querySelector('#contact-question');
   if(input&&!input.value)input.value=a.dataset.contactSubject;
  }));
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('video[data-loop-src]').forEach(video=>{
   video.muted=true;
   if(video.classList.contains('home-app-video')){
    const label=()=>video.setAttribute('aria-label',video.paused?"播放动画":"暂停动画");
    const toggle=()=>{if(!video.src)video.src=video.dataset.loopSrc;if(video.paused){video.dataset.userPaused='false';video.play().catch(()=>{})}else{video.dataset.userPaused='true';video.pause()}};
    video.addEventListener('play',label);video.addEventListener('pause',label);
    video.addEventListener('click',toggle);
    video.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle()}});
   }
   const show=()=>{
    if(!video.getAttribute('src'))video.src=video.dataset.loopSrc;
    if(!motion.matches&&!navigator.connection?.saveData&&video.dataset.userPaused!=='true')video.play().catch(()=>{});
   };
   if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)show();else video.pause()}),{rootMargin:'100px'});io.observe(video)}else show();
   motion.addEventListener('change',()=>{if(motion.matches)video.pause()});
   document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause()});
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
