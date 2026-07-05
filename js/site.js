/* ============================================================
   Purrrscribe — shared site script
   Header/footer inject, theme (+Giscus sync), language scaffold,
   and real form submission (notify + contact) to a Cloudflare Worker.
   ============================================================ */
(function(){
  "use strict";

  /* ⬇⬇ AFTER you deploy the Cloudflare Worker, paste its URL here (one line). ⬇⬇ */
  var WORKER_URL = "https://purrrscribe-forms.haddar.workers.dev".replace(/\/+$/,"");
  try{ window.PURRR_WORKER = WORKER_URL; }catch(e){}
  /* ⬆⬆ e.g. https://purrrscribe-forms.haddar.workers.dev  (no trailing slash) ⬆⬆ */

  var LANGS = [ { code:"en", name:"English", dir:"ltr", flag:flagUS() } ];

  var EMAIL_HELLO="hello@purrrscribe.com", EMAIL_SUPPORT="support@purrrscribe.com";
  var REDDIT="https://www.reddit.com/r/purrrscribe/";
  var FACEBOOK="https://www.facebook.com/profile.php?id=61591320103506";
  var INSTAGRAM="https://www.instagram.com/official.purrrscribe/";
  var YOUTUBE="https://www.youtube.com/channel/UCmNJzhbwi8r1SNK9iFl8b1Q";
  var LINKEDIN="https://www.linkedin.com/in/haddar-demerchant-875162407/";

  function get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

  function flagUS(){ return '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true">\
<rect width="30" height="20" fill="#fff"/>\
<g fill="#b22234"><rect width="30" height="1.55"/><rect y="3.1" width="30" height="1.55"/>\
<rect y="6.2" width="30" height="1.55"/><rect y="9.3" width="30" height="1.55"/>\
<rect y="12.4" width="30" height="1.55"/><rect y="15.5" width="30" height="1.55"/><rect y="18.6" width="30" height="1.4"/></g>\
<rect width="13" height="10.85" fill="#3c3b6e"/>\
<g fill="#fff"><circle cx="2.2" cy="2" r=".7"/><circle cx="5.5" cy="2" r=".7"/><circle cx="8.8" cy="2" r=".7"/>\
<circle cx="2.2" cy="5.4" r=".7"/><circle cx="5.5" cy="5.4" r=".7"/><circle cx="8.8" cy="5.4" r=".7"/>\
<circle cx="2.2" cy="8.8" r=".7"/><circle cx="5.5" cy="8.8" r=".7"/><circle cx="8.8" cy="8.8" r=".7"/></g></svg>'; }
  function sun(){ return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>'; }
  function moon(){ return '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A8.5 8.5 0 1111.2 3 6.6 6.6 0 0021 12.8z"/></svg>'; }
  function auto(){ return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 010 18z" fill="currentColor" stroke="none"/></svg>'; }
  function globe(){ return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"/></svg>'; }

  var NAV = [
    { href:"/",                  key:"nav.home" },
    { href:"/about.html",        key:"nav.about" },
    { href:"/demos/voices.html", key:"nav.demos" },
    { href:"/community/",        key:"nav.community" },
    { href:"/faq.html",          key:"nav.faq" },
    { href:"/contact.html",      key:"nav.contact" }
  ];
  function path(){ var p=location.pathname; if(p.endsWith("/index.html")) p=p.slice(0,-10); return p||"/"; }
  function isCurrent(href){
    var here=path();
    if(href==="/") return here==="/";
    if(href==="/demos/voices.html") return here.indexOf("/demos/")===0;
    if(href==="/community/") return here.indexOf("/community")===0;
    return here===href;
  }

  function buildHeader(){
    var links=NAV.map(function(n){ return '<a href="'+n.href+'" data-i18n="'+n.key+'"'+(isCurrent(n.href)?' aria-current="page"':'')+'>'+n.key+'</a>'; }).join("");
    var langCtrl = LANGS.length>1 ? '<div class="lang"><button class="iconbtn" id="langBtn" aria-haspopup="true" aria-expanded="false">'+globe()+'<span id="langCode">EN</span></button><div class="lang-menu" id="langMenu" role="menu">'+LANGS.map(function(l){return '<button type="button" data-lang="'+l.code+'">'+l.flag+'<span>'+l.name+'</span></button>';}).join("")+'</div></div>' : '';
    return '\
<a class="skip" href="#main" data-i18n="common.skip">Skip to content</a>\
<div class="nav">\
  <a class="brand" href="/"><img src="/assets/icon.png" alt=""><span>Purrrscribe</span></a>\
  <nav class="nav-links" id="navLinks" aria-label="Main">'+links+'</nav>\
  <div class="nav-tools">\
    <button class="iconbtn menu-toggle" id="menuToggle" aria-label="Menu">\u2630</button>\
    <button class="iconbtn" id="themeBtn" aria-label="Theme"></button>'+langCtrl+'\
  </div>\
</div>';
  }
  function buildFooter(){
    return '\
<div class="footer-inner">\
  <div>\
    <div class="footer-brand"><img src="/assets/icon.png" alt=""><span>Purrrscribe</span></div>\
    <p class="muted" style="max-width:30ch;margin-top:10px;font-size:.9rem" data-i18n="brand.tagline">Privacy-first voice \u2194 text. Powered by purrrs.</p>\
  </div>\
  <div class="footer-links">\
    <div class="footer-col"><h4 data-i18n="footer.product">Product</h4>\
      <a href="/about.html" data-i18n="nav.about">About</a>\
      <a href="/demos/voices.html" data-i18n="nav.demos">Demos</a>\
      <a href="/#notify" data-i18n="common.notify">Notify me</a></div>\
    <div class="footer-col"><h4 data-i18n="footer.community">Community</h4>\
      <a href="/community/" data-i18n="nav.community">Community</a>\
      <a href="'+REDDIT+'" target="_blank" rel="noopener">r/purrrscribe</a>\
      <a href="'+INSTAGRAM+'" target="_blank" rel="noopener">Instagram</a>\
      <a href="'+FACEBOOK+'" target="_blank" rel="noopener">Facebook</a>\
      <a href="'+YOUTUBE+'" target="_blank" rel="noopener">YouTube</a>\
      <a href="'+LINKEDIN+'" target="_blank" rel="noopener">LinkedIn</a></div>\
    <div class="footer-col"><h4 data-i18n="footer.support">Support</h4>\
      <a href="/faq.html" data-i18n="nav.faq">FAQ</a>\
      <a href="/contact.html" data-i18n="nav.contact">Contact</a>\
      <a href="mailto:'+EMAIL_SUPPORT+'">'+EMAIL_SUPPORT+'</a></div>\
  </div>\
</div>\
<div class="footer-bottom"><span data-i18n="footer.rights">\u00A9 2026 Purrrscribe.</span> <span data-i18n="footer.madeby">Made with care (and cats).</span></div>';
  }

  /* ---- theme (+giscus sync) ---------------------------------------- */
  var THEME_KEY="purrrscribe.theme";
  function systemDark(){ try{ return matchMedia("(prefers-color-scheme:dark)").matches; }catch(e){ return false; } }
  function resolveTheme(m){ return m==="auto"?(systemDark()?"dark":"light"):m; }
  function syncGiscus(r){ try{ var live=location.hostname.indexOf("purrrscribe.com")>-1; var t=live?(location.origin+(r==="dark"?"/css/giscus-dark.css?v=3":"/css/giscus-light.css?v=3")):(r==="dark"?"dark_dimmed":"light"); var f=document.querySelector("iframe.giscus-frame"); if(f&&f.contentWindow) f.contentWindow.postMessage({giscus:{setConfig:{theme:t}}},"https://giscus.app"); }catch(e){} }
  function applyTheme(m){
    var r=resolveTheme(m); document.documentElement.setAttribute("data-theme",r);
    var b=document.getElementById("themeBtn"); if(b) b.innerHTML=(m==="auto"?auto():m==="dark"?moon():sun())+'<span style="font-size:.78rem">'+(m==="auto"?"Auto":m==="dark"?"Dark":"Light")+'</span>';
    syncGiscus(r);
  }
  function initTheme(){
    var m=get(THEME_KEY)||"auto"; applyTheme(m);
    var b=document.getElementById("themeBtn"); if(b) b.addEventListener("click",function(){ m=m==="light"?"dark":m==="dark"?"auto":"light"; set(THEME_KEY,m); applyTheme(m); });
    try{ matchMedia("(prefers-color-scheme:dark)").addEventListener("change",function(){ if((get(THEME_KEY)||"auto")==="auto") applyTheme("auto"); }); }catch(e){}
    window.addEventListener("message",function(e){ if(e.origin==="https://giscus.app"&&e.data&&e.data.giscus) syncGiscus(resolveTheme(get(THEME_KEY)||"auto")); });
  }

  /* ---- i18n -------------------------------------------------------- */
  var LANG_KEY="purrrscribe.lang", dict={};
  function t(k){ return (dict&&dict[k]!=null)?dict[k]:k; }
  function applyI18n(){
    document.querySelectorAll("[data-i18n]").forEach(function(el){ var v=t(el.getAttribute("data-i18n")); if(String(v).indexOf("<br")>-1){ el.innerHTML=v; } else { el.textContent=v; } });
    document.querySelectorAll("[data-i18n-html]").forEach(function(el){ el.innerHTML=t(el.getAttribute("data-i18n-html")); });
    document.querySelectorAll("[data-i18n-attr]").forEach(function(el){ el.getAttribute("data-i18n-attr").split(";").forEach(function(p){ var q=p.split(":"); if(q.length===2) el.setAttribute(q[0].trim(),t(q[1].trim())); }); });
  }
  function setLang(code){
    var L=LANGS.filter(function(x){return x.code===code;})[0]||LANGS[0];
    document.documentElement.lang=L.code; document.documentElement.dir=L.dir;
    var cc=document.getElementById("langCode"); if(cc) cc.textContent=L.code.toUpperCase();
    fetch("/i18n/"+code+".json",{cache:"no-cache"}).then(function(r){return r.ok?r.json():{};}).then(function(j){ dict=j; applyI18n(); }).catch(function(){});
    set(LANG_KEY,code);
  }
  function initLang(){
    setLang(get(LANG_KEY)||"en");
    var btn=document.getElementById("langBtn"), menu=document.getElementById("langMenu");
    if(btn&&menu){ btn.addEventListener("click",function(e){ e.stopPropagation(); var o=menu.classList.toggle("open"); btn.setAttribute("aria-expanded",o?"true":"false"); });
      menu.querySelectorAll("button").forEach(function(b){ b.addEventListener("click",function(){ setLang(b.getAttribute("data-lang")); menu.classList.remove("open"); btn.setAttribute("aria-expanded","false"); }); });
      document.addEventListener("click",function(){ menu.classList.remove("open"); }); }
  }
  function initMenu(){ var b=document.getElementById("menuToggle"), l=document.getElementById("navLinks"); if(b&&l) b.addEventListener("click",function(){ l.classList.toggle("show"); }); }

  /* ---- real forms (notify + contact) -> Cloudflare Worker ---------- */
  function initForms(){
    document.querySelectorAll("form[data-purrr]").forEach(function(f){
      f.addEventListener("submit",function(e){
        e.preventDefault();
        var kind=f.getAttribute("data-purrr");
        var okBox=f.parentNode.querySelector(".form-ok"), errBox=f.parentNode.querySelector(".form-err");
        if(errBox) errBox.hidden=true;
        var data={}; new FormData(f).forEach(function(v,k){ data[k]=(""+v).trim(); });
        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email||"")){ var em=f.querySelector('[name="email"]'); if(em){em.setAttribute("aria-invalid","true"); em.focus();} return; }
        var btn=f.querySelector('[type="submit"]'); var label=btn?btn.textContent:"";
        if(btn){ btn.disabled=true; btn.textContent="…"; }
        fetch(WORKER_URL+"/"+kind,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
          .then(function(r){ if(!r.ok) throw 0; return r.text(); })
          .then(function(){ f.hidden=true; if(okBox) okBox.hidden=false; })
          .catch(function(){ if(errBox) errBox.hidden=false; if(btn){ btn.disabled=false; btn.textContent=label; } });
      });
    });
  }

  function boot(){
    var h=document.getElementById("site-header"); if(h) h.innerHTML=buildHeader();
    var f=document.getElementById("site-footer"); if(f) f.innerHTML=buildFooter();
    initTheme(); initMenu(); initLang(); initForms();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
