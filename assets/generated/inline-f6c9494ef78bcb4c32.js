
document.addEventListener("DOMContentLoaded",()=>{
(()=>{
 'use strict';
 const menus=[...document.querySelectorAll('details[data-site-menu]')];
 for(const menu of menus){
  const summary=menu.querySelector('summary');
  menu.addEventListener('click',event=>{if(event.target.closest('nav a'))menu.open=false;});
  const mobile=matchMedia(`(max-width:${menu.dataset.menuBreakpoint||1023}px)`);
  mobile.addEventListener('change',event=>{if(!event.matches)menu.open=false;});
  menu.addEventListener('keydown',event=>{
   if(event.key==='Escape'&&menu.open){menu.open=false;summary.focus();event.preventDefault();}
  });
 }
 document.addEventListener('pointerdown',event=>{
  for(const menu of menus)if(menu.open&&!menu.contains(event.target))menu.open=false;
 });
})();

},{once:true});
