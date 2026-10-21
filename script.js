/* =====================================================
   PROPOOL — script.js (الصفحة الرئيسية)
   ===================================================== */
/* ================= CONFIG ================= */
// رقم الواتساب اللي بتوصله رسائل الفورم (للاختبار غيّره لرقمك وبعدها رجّعه)
const WHATSAPP_NUMBER = '96555571687';
// رابط Google Apps Script اللي بيسجل الرسائل في الشيت
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwOGESaRMaBJdEWOrFyzqO1BcMTMMpL_uKcxEpIsEshk4bAMblXf-Rmdr7739ii9qvG/exec';
/* ================= SAFE STORAGE ================= */
// localStorage ممكن يرمي error في بعض المتصفحات (مثلًا Safari في الوضع الخاص)
const store = {
  get(key){ try { return localStorage.getItem(key); } catch(e){ return null; } },
  set(key, val){ try { localStorage.setItem(key, val); } catch(e){} }
};
/* ================= DATA ================= */
const galleryImgs = [
  'image/pool-1.webp',
  'image/pool-2.webp',
  'image/pool-3.webp',
  'image/pool-4.webp',
  'image/pool-5.webp',
  'image/pool-6.webp',
  'image/pool-7.webp',
  'image/pool-8.webp',
  'image/pool-9.webp'
];
const faqs = [
  {q:{ar:'كم يستغرق بناء مسبح فاخر في الكويت؟',en:'How long does it take to build a luxury pool in Kuwait?'}, a:{ar:'تتراوح المدة عادة بين 6 إلى 10 أسابيع حسب حجم المسبح والتشطيبات المطلوبة والظروف الجوية.', en:'It typically takes 6 to 10 weeks depending on pool size, finishing requirements and weather conditions.'}},
  {q:{ar:'هل تقدمون ضمانًا على أعمال الإنشاء؟',en:'Do you offer a warranty on construction work?'}, a:{ar:'نعم، نقدم ضمانًا شاملًا يغطي الهيكل الإنشائي والعزل والمعدات لمدة تصل إلى 10 سنوات.', en:'Yes, we offer a comprehensive warranty covering structure, waterproofing and equipment for up to 10 years.'}},
  {q:{ar:'هل يمكنكم ترميم مسبح قديم بدلًا من إنشاء مسبح جديد؟',en:'Can you renovate an old pool instead of building a new one?'}, a:{ar:'بالتأكيد، لدينا فريق متخصص في ترميم المسابح القديمة وتحديث التشطيبات والأنظمة بالكامل.', en:'Absolutely, we have a dedicated team specialized in renovating old pools and fully upgrading finishes and systems.'}},
  {q:{ar:'كيف تعمل خطط الصيانة الشهرية؟',en:'How do the monthly maintenance plans work?'}, a:{ar:'نقوم بزيارات دورية حسب الخطة المختارة تشمل فحص المياه، التنظيف، وصيانة المعدات مع تقرير دوري.', en:'We conduct scheduled visits per your chosen plan, including water testing, cleaning and equipment maintenance with regular reporting.'}},
  {q:{ar:'هل تقدمون استشارة تصميم مجانية؟',en:'Do you offer a free design consultation?'}, a:{ar:'نعم، نوفر استشارة أولية مجانية لفهم احتياجاتك وتقديم مقترح تصميم مبدئي.', en:'Yes, we provide a free initial consultation to understand your needs and present an initial design proposal.'}}
];
/* ================= RENDER ================= */
let currentLang = document.documentElement.lang || 'ar';
function svgIcon(path){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
}

function renderGallery(){
  const grid = document.getElementById('masonryGrid');
  if(!grid) return;
  grid.innerHTML = galleryImgs.map((g,i)=>`
    <div class="g-item reveal" data-idx="${i}">
      <img src="${g}" alt="${currentLang==='ar' ? 'صورة من أعمال بروبول' : 'PROPOOL project photo'} ${i+1}" loading="lazy">
      <div class="g-overlay">${svgIcon('M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z')}</div>
    </div>`).join('');
}
function renderFaq(){
  const list = document.getElementById('faqList');
  if(!list) return;
  list.innerHTML = faqs.map(f=>`
    <div class="faq-item reveal">
      <div class="faq-q"><span data-ar="${f.q.ar}" data-en="${f.q.en}">${currentLang==='ar'?f.q.ar:f.q.en}</span><div class="plus"></div></div>
      <div class="faq-a"><p data-ar="${f.a.ar}" data-en="${f.a.en}">${currentLang==='ar'?f.a.ar:f.a.en}</p></div>
    </div>`).join('');
  list.querySelectorAll('.faq-q').forEach(q=>{
    q.addEventListener('click',()=>{
      const item = q.parentElement;
      const wasOpen = item.classList.contains('open');
      list.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
      if(!wasOpen) item.classList.add('open');
    });
  });
}
function renderAll(){
  renderGallery();
  renderFaq();
  observeReveal();
  bindLightbox();
}
/* ================= I18N ================= */
function applyLang(lang){
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  const langLabel = document.getElementById('langLabel');
  if(langLabel) langLabel.textContent = lang === 'ar' ? 'English' : 'العربية';
  document.querySelectorAll('[data-ar]').forEach(el=>{
    const val = el.getAttribute(lang === 'ar' ? 'data-ar' : 'data-en');
    if(val !== null) el.textContent = val;
  });
  document.querySelectorAll('[data-ar-ph]').forEach(el=>{
    const val = el.getAttribute(lang === 'ar' ? 'data-ar-ph' : 'data-en-ph');
    if(val !== null) el.setAttribute('placeholder', val);
  });
  renderAll();               // يعيد رسم الأقسام الديناميكية باللغة الجديدة
  store.set('propool-lang', lang);
}
const langToggle = document.getElementById('langToggle');
if(langToggle){
  langToggle.addEventListener('click',()=>{
    applyLang(currentLang === 'ar' ? 'en' : 'ar');
  });
}
/* ================= THEME ================= */
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  const themeLabel = document.getElementById('themeLabel');
  if(themeLabel){
    const ar = theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن';
    const en = theme === 'dark' ? 'Light Mode'   : 'Dark Mode';
    themeLabel.setAttribute('data-ar', ar);
    themeLabel.setAttribute('data-en', en);
    themeLabel.textContent = currentLang === 'ar' ? ar : en;
  }
  const themeIcon = document.getElementById('themeIcon');
  if(themeIcon){
    themeIcon.innerHTML = theme === 'dark'
      ? `<path d="M12 3v2"/><path d="M12 19v2"/><path d="m4.22 4.22 1.42 1.42"/><path d="m18.36 18.36 1.42 1.42"/><path d="M3 12h2"/><path d="M19 12h2"/><path d="m4.22 19.78 1.42-1.42"/><path d="m18.36 5.64 1.42-1.42"/><circle cx="12" cy="12" r="4"/>`
      : `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>`;
  }
  store.set('propool-theme', theme);
}
const themeToggle = document.getElementById('themeToggle');
if(themeToggle){
  themeToggle.addEventListener('click',()=>{
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });
}
/* ================= NAV + SCROLL ================= */
const mainNav  = document.getElementById('mainNav');
const backTop  = document.getElementById('backTop');
const heroBg   = document.getElementById('heroBg');
const HERO_SCALE = 1.08;        // حجم الصورة الأساسي (بيتحكم فيه هنا، مش في الـ CSS)

function onScroll(){
  const y = window.scrollY;
  if(mainNav) mainNav.classList.toggle('scrolled', y > 20);
  if(backTop) backTop.classList.toggle('show', y > 500);
  if(heroBg && y < window.innerHeight){
    heroBg.style.transform = `scale(${HERO_SCALE}) translateY(${y*0.25}px)`;
  }
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();                      // يضبط الوضع الابتدائي بدون قفزة عند أول سكرول

if(backTop){
  backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}
/* ================= MOBILE MENU ================= */
document.addEventListener('DOMContentLoaded', function(){
  const menu = document.getElementById('menu');
  const navLinks = document.getElementById('navLinks');
  if(!menu || !navLinks) return;
  function closeMobileMenu(){
    if(!navLinks.classList.contains('open')) return;
    navLinks.style.transition = 'none';          // إغلاق فوري
    navLinks.classList.remove('open');
    menu.classList.remove('active');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ navLinks.style.transition = ''; }));
  }
  function openMobileMenu(){
    navLinks.style.transition = '';
    navLinks.classList.add('open');
    menu.classList.add('active');
  }
  menu.addEventListener('click', e=>{
    e.stopPropagation();
    navLinks.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });
  document.addEventListener('click', e=>{
    if(!navLinks.classList.contains('open')) return;
    if(!navLinks.contains(e.target) && !menu.contains(e.target)) closeMobileMenu();
  });
  window.addEventListener('scroll', closeMobileMenu, {passive:true});
  navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click', closeMobileMenu));
});
/* ================= REVEAL ON SCROLL ================= */
function observeReveal(){
  const els = document.querySelectorAll('.reveal:not(.in), .reveal-scale:not(.in)');
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  },{threshold:.15});
  els.forEach(el=>io.observe(el));
}
/* ================= PRICING PLANS → WHATSAPP ================= */
(function(){
  document.querySelectorAll('.price-card .price-cta').forEach(btn=>{
    const card   = btn.closest('.price-card');
    const nameEl = card.querySelector('.price-name');
    const descEl = card.querySelector('.price-desc span');
    const amount = card.querySelector('.price-amount');

    // الرسالة بالعربي دايمًا لأنها بتوصل لفريق الشركة
    const plan   = nameEl ? nameEl.getAttribute('data-ar') : '';
    const visits = descEl ? descEl.getAttribute('data-ar') : '';
    const price  = (amount && amount.childNodes[0]) ? amount.childNodes[0].textContent.trim() : '';

    const text =
`مرحبًا بروبول، اخترت باقة (${plan})
📅 الزيارات: ${visits}
💰 السعر: يبدأ من ${price} دينار كويتي شهريًا
أرغب في الاشتراك بهذه الباقة، برجاء التواصل معي.`;

    btn.href   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    btn.target = '_blank';
    btn.rel    = 'noopener';
  });
})();
/* ================= COUNTERS ================= */
function animateCounters(){
  document.querySelectorAll('.stat-num').forEach(el=>{
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    if(isNaN(target)) return;
    let cur = 0;
    const step = Math.max(1, Math.round(target/60));
    const timer = setInterval(()=>{
      cur += step;
      if(cur >= target){ cur = target; clearInterval(timer); }
      el.textContent = cur + suffix;
    }, 20);
  });
}
const statsSection = document.querySelector('.stats');
if(statsSection){
  const statsIO = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ animateCounters(); statsIO.disconnect(); }
    });
  },{threshold:.4});
  statsIO.observe(statsSection);
}
/* ================= BEFORE / AFTER SLIDER ================= */
document.querySelectorAll('.ba-wrap').forEach(wrap=>{
  const handle = wrap.querySelector('.ba-handle');
  const after  = wrap.querySelector('.ba-after');
  if(!handle || !after) return;
  let dragging = false;
  function move(x){
    const rect = wrap.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.max(2, Math.min(98, pct));
    handle.style.left = pct + '%';
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
  }
  handle.addEventListener('pointerdown', e=>{
    dragging = true;
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', e=>{ if(dragging) move(e.clientX); });
  handle.addEventListener('pointerup', ()=>{ dragging = false; });
  handle.addEventListener('pointercancel', ()=>{ dragging = false; });
});
/* ================= LIGHTBOX ================= */
let lbIndex = 0;
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');

function bindLightbox(){
  document.querySelectorAll('.g-item').forEach(item=>{
    item.addEventListener('click',()=>{
      lbIndex = parseInt(item.getAttribute('data-idx'), 10);
      openLightbox();
    });
  });
}
function openLightbox(){
  if(!lightbox || !lbImg) return;
  lbImg.src = galleryImgs[lbIndex];
  lightbox.classList.add('open');
}
function closeLightbox(){
  if(lightbox) lightbox.classList.remove('open');
}
function stepLightbox(dir){
  lbIndex = (lbIndex + dir + galleryImgs.length) % galleryImgs.length;
  openLightbox();
}

if(lightbox){
  const lbClose = document.getElementById('lbClose');
  const lbNext  = document.getElementById('lbNext');
  const lbPrev  = document.getElementById('lbPrev');
  if(lbClose) lbClose.addEventListener('click', closeLightbox);
  if(lbNext)  lbNext.addEventListener('click', ()=>stepLightbox(1));
  if(lbPrev)  lbPrev.addEventListener('click', ()=>stepLightbox(-1));
  lightbox.addEventListener('click', e=>{ if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e=>{
    if(!lightbox.classList.contains('open')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowRight') stepLightbox(1);
    if(e.key === 'ArrowLeft')  stepLightbox(-1);
  });
}
/* ================= FILTER BAR ================= */
document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
});
/* ================= RIPPLE ================= */
document.addEventListener('click', e=>{
  const btn = e.target.closest('[data-ripple]');
  if(!btn) return;
  const rect = btn.getBoundingClientRect();
  const circle = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  circle.style.width = circle.style.height = size + 'px';
  circle.style.left = (e.clientX - rect.left - size/2) + 'px';
  circle.style.top  = (e.clientY - rect.top  - size/2) + 'px';
  circle.classList.add('ripple');
  btn.appendChild(circle);
  setTimeout(()=>circle.remove(), 700);
});
/* ================= FORM → GOOGLE SHEET + WHATSAPP ================= */
const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name    = document.getElementById('cfName').value.trim();
    const phone   = document.getElementById('cfPhone').value.trim();
    const email   = document.getElementById('cfEmail').value.trim();
    const message = document.getElementById('cfMessage').value.trim();
    // تسجيل الرسالة في Google Sheet (لو فشل ما يوقفش الواتساب)
    fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ name, phone, email, message })
    }).catch(err => console.log('Sheet error:', err));
    const text =
`مرحبًا بروبول، أنا ${name}
📱 الهاتف: ${phone}
${email ? `✉️ البريد: ${email}\n` : ''}📝 الرسالة: ${message}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  });
}
/* ================= PLAN BUILDER (صمم باقتك) → GOOGLE SHEET + WHATSAPP ================= */
const planForm = document.getElementById('planForm');
if(planForm){
  const visitsWrap   = document.getElementById('pfVisitsWrap');
  const visitsSelect = document.getElementById('pfVisits');
  // يظهر "عدد الزيارات شهريًا" فقط لو اختار زيارات متعددة
  function syncVisits(){
    const type  = planForm.querySelector('input[name="visitType"]:checked');
    const multi = !!type && type.value === 'multi';
    visitsWrap.hidden = !multi;
    visitsSelect.required = multi;
    if(!multi) visitsSelect.value = '';
  }
  planForm.querySelectorAll('input[name="visitType"]').forEach(r=>{
    r.addEventListener('change', syncVisits);
  });
  syncVisits();
  // نص الاختيار بالعربي دايمًا (الرسالة بتتبعت لفريق الشركة بالعربي)
  function arChoice(name){
    const el = planForm.querySelector(`input[name="${name}"]:checked`);
    if(!el) return '';
    const span = el.closest('.pf-opt').querySelector('span');
    return span ? span.getAttribute('data-ar') : el.value;
  }
  planForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name  = document.getElementById('pfName').value.trim();
    const phone = document.getElementById('pfPhone').value.trim();
    const size  = document.getElementById('pfSize').value.trim();
    const depth = document.getElementById('pfDepth').value.trim();
    const area  = document.getElementById('pfArea').value.trim();
    const ownership = arChoice('ownership');
    const cover     = arChoice('cover');
    const visitType = arChoice('visitType');
    let visits = '';
    if(!visitsWrap.hidden && visitsSelect.selectedOptions[0]){
      visits = visitsSelect.selectedOptions[0].getAttribute('data-ar');
    }
    const lines = [
      'مرحبًا بروبول، أرغب في تصميم باقة صيانة مخصصة:',
      `👤 الاسم: ${name}`,
      `📱 الهاتف: ${phone}`,
      `📐 حجم المسبح: ${size} م²`,
      `↕️ عمق المسبح: ${depth} متر`,
      `📍 المنطقة: ${area}`,
      `🏠 نوع العقار: ${ownership}`,
      `☀️ نوع المسبح: ${cover}`,
      `🔁 نوع الخدمة: ${visitType}`
    ];
    if(visits) lines.push(`📅 عدد الزيارات شهريًا: ${visits}`);
    const text = lines.join('\n');
    // تسجيل في Google Sheet بنفس الحقول القديمة (name, phone, email, message)
    fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ name, phone, email: '', message: text })
    }).catch(err => console.log('Sheet error:', err));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  });
}
/* ================= ABOUT SLIDER ================= */
(function(){
  const slides = document.querySelectorAll('#aboutSlider img');
  if(slides.length < 2) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let current = 0;
  setInterval(()=>{
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 4000);
})();
/* ================= PRELOADER ================= */
// يختفي أول ما الصفحة تجهز (من غير ما يستنى الصور والفيديوهات)
function hidePreloader(){
  const p = document.getElementById('preloader');
  if(p) p.classList.add('hide');
}
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ()=>setTimeout(hidePreloader, 400));
}else{
  setTimeout(hidePreloader, 400);
}
setTimeout(hidePreloader, 2500);  // أمان: يختفي بعد 2.5 ثانية على الأكتر مهما حصل
/* ================= INIT ================= */
applyLang(store.get('propool-lang') || document.documentElement.lang || 'ar');
applyTheme(store.get('propool-theme') || 'light');