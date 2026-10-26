
function initApprovedPewcb(){

  (function () {
    var root = document.querySelector('.pewcb-quality');
    if (!root || root.dataset.lightboxReady === 'true') return;
    root.dataset.lightboxReady = 'true';
    var triggers = Array.prototype.slice.call(root.querySelectorAll('.pewcb-quality__zoom'));
    var lightbox = root.querySelector('.pewcb-quality__lightbox');
    var fullImage = root.querySelector('.pewcb-quality__lightbox-image');
    var closeButton = root.querySelector('.pewcb-quality__lightbox-close');
    var previousButton = root.querySelector('.pewcb-quality__lightbox-prev');
    var nextButton = root.querySelector('.pewcb-quality__lightbox-next');
    var activeIndex = 0;
    var lastTrigger = null;
    var previousOverflow = '';
    function show(index) {
      activeIndex = (index + triggers.length) % triggers.length;
      var image = triggers[activeIndex].querySelector('img');
      fullImage.src = image.currentSrc || image.src;
      fullImage.alt = image.alt;
    }
    function openLightbox(index, trigger) {
      lastTrigger = trigger;
      show(index);
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      closeButton.focus();
    }
    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      fullImage.src = '';
      document.body.style.overflow = previousOverflow;
      if (lastTrigger) lastTrigger.focus();
    }
    triggers.forEach(function (trigger, index) { trigger.addEventListener('click', function () { openLightbox(index, trigger); }); });
    closeButton.addEventListener('click', closeLightbox);
    previousButton.addEventListener('click', function () { show(activeIndex - 1); });
    nextButton.addEventListener('click', function () { show(activeIndex + 1); });
    lightbox.addEventListener('click', function (event) { if (event.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (event) {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(activeIndex - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(activeIndex + 1); }
      if (event.key === 'Tab') {
        var controls = [closeButton, previousButton, nextButton];
        var position = controls.indexOf(document.activeElement);
        event.preventDefault();
        controls[(position + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
      }
    });
  })();


  (function () {
    var form = document.getElementById("form-pewcb-direct-contact");
    if (!form) return;

    var fields = form.querySelectorAll("[required]");

    function getValidationMessage(field) {
      if (field.type === "checkbox") {
        return "请阅读并同意个人信息处理政策。";
      }

      if (field.tagName === "SELECT") {
        return "请选择联系方式。";
      }

      if (field.type === "email") {
        return field.validity.typeMismatch
          ? "请输入有效的电子邮箱。"
          : "请填写此项。";
      }

      return "请填写此项。";
    }

    function syncValidationMessage(field) {
      field.setCustomValidity("");

      if (field.validity.valueMissing || field.validity.typeMismatch) {
        field.setCustomValidity(getValidationMessage(field));
      }
    }

    fields.forEach(function (field) {
      field.addEventListener("invalid", function () {
        syncValidationMessage(field);
      });

      ["input", "change"].forEach(function (eventName) {
        field.addEventListener(eventName, function () {
          syncValidationMessage(field);
        });
      });

      syncValidationMessage(field);
    });
  })();


(() => {
  const preview = document.querySelector('.pewcb-workflow__video');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) { preview.removeAttribute('autoplay'); preview.controls = true; preview.pause(); }
  else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting && !document.hidden) preview.play().catch(() => {});
      else preview.pause();
    }), {threshold:.05});
    observer.observe(preview);
    document.addEventListener('visibilitychange', () => { if (document.hidden) preview.pause(); });
  }
})();

}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initApprovedPewcb);else initApprovedPewcb();
(function(){
 function init(){
  document.querySelectorAll('.pewcb-workflow__video').forEach(video=>{
   const motion=matchMedia('(prefers-reduced-motion:reduce)');
   const start=()=>{if(motion.matches||navigator.connection?.saveData){video.pause();return}if(!video.getAttribute('src'))video.src=video.dataset.lazySrc;video.play().catch(()=>{})};
   if('IntersectionObserver' in window)new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting?start():video.pause()),{rootMargin:'150px'}).observe(video);else start();
   motion.addEventListener('change',()=>motion.matches?video.pause():start());
  });
  const embedURL=value=>{try{const u=new URL(value),host=u.hostname.replace(/^www\./,'');let id;if(host==='youtu.be')id=u.pathname.split('/')[1];else if(['youtube.com','youtube-nocookie.com'].includes(host))id=u.searchParams.get('v')||u.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1];if(id&&/^[\w-]{11}$/.test(id))return 'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1';if(['vimeo.com','player.vimeo.com'].includes(host)){id=u.pathname.match(/(?:\/video)?\/(\d+)/)?.[1];if(id)return 'https://player.vimeo.com/video/'+id+'?autoplay=1&dnt=1'}}catch{}return null};
  document.querySelectorAll('.rev-media').forEach(media=>{
   const play=media.querySelector('.rev-media__play'),source=media.dataset.mediaSrc;
   if(!source||source.includes('{{')){play.disabled=true;play.textContent="演示视频即将上线";return}
   play.addEventListener('click',()=>{
    const url=embedURL(source);let player;
    if(url){player=document.createElement('iframe');player.src=url;player.title=media.getAttribute('aria-label');player.allow='autoplay; fullscreen; picture-in-picture';player.allowFullscreen=true;player.referrerPolicy='strict-origin-when-cross-origin'}
    else{player=document.createElement('video');player.controls=true;player.playsInline=true;player.preload='none';player.src=source;player.setAttribute('aria-label',media.getAttribute('aria-label'));}
    player.className='rev-media__player';media.append(player);media.classList.add('is-playing');const close=document.createElement('button');close.className='rev-media__close';close.type='button';close.textContent='×';close.setAttribute('aria-label',"关闭视频");media.append(close);
    close.addEventListener('click',()=>{if(player.tagName==='VIDEO')player.pause();player.remove();close.remove();media.classList.remove('is-playing');play.focus()});close.focus();
    if(player.tagName==='VIDEO')player.play().catch(()=>{});
   });
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

