(function(){
  const placeholders = [
    'Best free executor?',
    'Safest Android option?',
    'Compare Wave and Velocity',
    'Why is this executor detected?'
  ];

  function streamText(el, text){
    el.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
      i += Math.max(1, Math.floor(Math.random() * 4));
      el.textContent = text.slice(0, i);
      if (i >= text.length) clearInterval(timer);
    }, 16);
  }

  function enhanceMessage(el){
    const txt = el.textContent || '';
    if (!txt) return;
    const wrap = document.createElement('div');
    if (/warning|detected|unsafe|mixed trust/i.test(txt)) {
      wrap.className = 'beta-warning-card';
      wrap.textContent = txt;
      el.textContent = '';
      el.appendChild(wrap);
    }
    streamText(el, txt);
  }

  window.initBetaAssistantUI = function initBetaAssistantUI(){
    if (!document.body.classList.contains('beta-features-enabled')) return;
    const panel = document.getElementById('assistantPanel');
    const form = document.getElementById('assistantForm');
    const input = document.getElementById('assistantInput');
    const messages = document.getElementById('assistantMessages');
    if (!panel || !form || !input || !messages) return;
    if (panel.dataset.betaEnhanced === 'true') return;
    panel.dataset.betaEnhanced = 'true';
    panel.classList.add('beta-assistant-enhanced');

    const shell = document.createElement('div');
    shell.className = 'beta-assistant-shell';

    const left = document.createElement('aside');
    left.className = 'beta-assistant-col';
    left.innerHTML = '<h4 class="beta-side-title">Suggested Prompts</h4><div class="beta-list"></div><h4 class="beta-side-title">Categories</h4><div class="beta-list"><button class="beta-suggestion-chip">Safety</button><button class="beta-suggestion-chip">Pricing</button><button class="beta-suggestion-chip">Mobile</button><button class="beta-suggestion-chip">Comparison</button></div>';
    const list = left.querySelector('.beta-list');
    placeholders.forEach(p=>{ const b=document.createElement('button'); b.className='beta-suggestion-chip'; b.textContent=p; b.type='button'; b.onclick=()=>{ input.value=p; input.focus(); }; list.appendChild(b); });

    const main = document.createElement('section');
    main.className = 'beta-assistant-main';
    const ambient = document.createElement('div'); ambient.className='beta-ambient';
    messages.classList.add('beta-assistant-messages');
    form.classList.add('beta-assistant-input-wrap');
    input.setAttribute('placeholder', placeholders[0]);
    input.classList.add('beta-assistant-live-input');

    const right = document.createElement('aside');
    right.className = 'beta-assistant-col beta-assistant-col--right';
    right.innerHTML = '<h4 class="beta-side-title">Live Stats</h4><div class="beta-stat-card">Confidence meter: <strong>Dynamic</strong></div><h4 class="beta-side-title">Risk / Trust</h4><div class="beta-warning-card">Mixed trust reports update live from assistant output.</div><h4 class="beta-side-title">Compare View</h4><div class="beta-compare-grid"><div class="beta-compare-card">Wave</div><div class="beta-compare-card">Velocity</div></div>';

    const mainParent = messages.parentElement;
    if (!mainParent) return;
    main.append(ambient, messages, form);
    shell.append(left, main, right);
    panel.querySelector('h3')?.after(shell);

    window.setInterval(()=>{
      const idx = (placeholders.indexOf(input.placeholder) + 1) % placeholders.length;
      input.placeholder = placeholders[idx];
    }, 2600);

    new MutationObserver((mutations)=>{
      mutations.forEach(m=>m.addedNodes.forEach(n=>{
        if (!(n instanceof HTMLElement)) return;
        if (n.classList.contains('assistant-bot') || n.classList.contains('assistant-message')) enhanceMessage(n);
      }));
    }).observe(messages, { childList:true });
  };
})();
