(()=>{
 'use strict';
 const init=()=>{
  const header=document.querySelector('[data-common-header]');
  if(!header||header.dataset.ready)return;
  header.dataset.ready='true';
  const menu=header.querySelector('details'),summary=menu.querySelector('summary');
  menu.addEventListener('click',e=>{if(e.target.closest('nav a'))menu.open=false});
  menu.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;summary.focus();e.preventDefault()}});
  document.addEventListener('pointerdown',e=>{if(menu.open&&!header.contains(e.target))menu.open=false});
  matchMedia('(min-width:1280px)').addEventListener('change',e=>{if(e.matches)menu.open=false});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
