import { qs, qsa } from '../../core/dom.js';

export function initAssistant(ctx) {
  const { products, NO_ASSISTANT_TOKENS_MESSAGE, consumeAiTokenForAssistant, openNoAiTokensModal, setAssistantMessageMarkdown, askExploitAssistant, getLocalAssistantFallback, applyAllFilters } = ctx;
  const form = qs('#assistantForm'); const input = qs('#assistantInput'); const sendBtn = qs('#assistantSendBtn'); const messages = qs('#assistantMessages');
  if (!form || !input || !sendBtn || !messages || form.dataset.apiIntegrated === 'true') return;
  form.dataset.apiIntegrated = 'true';
  const appendMessage = (role,text)=>{ const el=document.createElement('article'); el.className=`assistant-message ${role==='user'?'assistant-user':'assistant-bot'}`; const d=document.createElement('div'); d.textContent=text; el.appendChild(d); messages.appendChild(el); messages.scrollTop=messages.scrollHeight; return el; };
  if (!messages.children.length) appendMessage('bot','Hello. I am your Exploit Assistant. Ask me about any active executor listed on this page.');
  form.addEventListener('submit', async event => { event.preventDefault(); const userMessage=input.value.trim(); if(!userMessage) return; if(!consumeAiTokenForAssistant()){ appendMessage('bot', NO_ASSISTANT_TOKENS_MESSAGE); openNoAiTokensModal(); return; } appendMessage('user', userMessage); input.value=''; input.disabled=true; sendBtn.disabled=true; const loading=appendMessage('bot','Reading your request...');
    try{ const apiPayload = await askExploitAssistant(userMessage); const apiReply=String(apiPayload?.reply||apiPayload?.message||'').trim(); setAssistantMessageMarkdown(loading, apiReply || getLocalAssistantFallback(userMessage)); }
    catch{ setAssistantMessageMarkdown(loading, getLocalAssistantFallback(userMessage)); }
    finally{ input.disabled=false; sendBtn.disabled=false; input.focus(); applyAllFilters(); }
  });
}
