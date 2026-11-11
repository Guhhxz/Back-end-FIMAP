/* Explicit visual blocks: ```fimap followed by JSON (see docs/ai-chat.md). */
window.FimapRenderer = (() => {
  const el = (tag, cls, text) => {
    const node = document.createElement(tag)
    if (cls) node.className = cls
    if (text !== undefined) node.textContent = text
    return node
  }
  const copy = (text, label = 'Copiar') => {
    const button = el('button', 'ai-copy', label)
    button.type = 'button'
    button.onclick = async () => {
      try { await navigator.clipboard.writeText(text); button.textContent = 'Copiado' }
      catch { button.textContent = 'Não foi possível copiar' }
      setTimeout(() => { button.textContent = label }, 2000)
    }
    return button
  }
  const types = { resumo: 'Resumo', informacao: 'Informação importante', atencao: 'Atenção', dica: 'Dica', comparacao: 'Comparação', recomendacao: 'Recomendação' }
  function visual(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.metrics) || data.metrics.length > 8 || !data.metrics.every(m => m && typeof m.label === 'string' && Number.isFinite(m.value) && ['BRL', 'percent', 'number'].includes(m.format))) throw Error('Formato inválido')
    const card = el('section', 'ai-financial')
    card.append(el('h3', '', typeof data.title === 'string' ? data.title : 'Análise financeira'))
    if (typeof data.summary === 'string') card.append(el('p', '', data.summary))
    const grid = el('div', 'ai-metrics')
    data.metrics.forEach(m => {
      const metric = el('div', 'ai-metric')
      const options = m.format === 'BRL' ? { style: 'currency', currency: 'BRL' } : { maximumFractionDigits: 2 }
      const value = new Intl.NumberFormat('pt-BR', options).format(m.value) + (m.format === 'percent' ? '%' : '')
      metric.append(el('span', 'ai-label', m.label), el('strong', '', value)); grid.append(metric)
    })
    card.append(grid)
    if (Array.isArray(data.bars)) data.bars.slice(0, 8).forEach(b => {
      if (!b || typeof b.label !== 'string' || !Number.isFinite(b.value) || !Number.isFinite(b.total) || b.total <= 0 || b.value < 0 || b.value > b.total) return
      const row = el('div', 'ai-bar')
      row.append(el('span', '', b.label), el('span', '', new Intl.NumberFormat('pt-BR', {style:'percent', maximumFractionDigits:1}).format(b.value / b.total)))
      const progress = el('progress'); progress.max = b.total; progress.value = b.value; progress.setAttribute('aria-label', b.label)
      row.append(progress); card.append(row)
    })
    if (Array.isArray(data.callouts)) data.callouts.slice(0, 6).forEach(c => {
      if (!c || !types[c.type] || typeof c.text !== 'string') return
      const note = el('aside', `ai-callout ${c.type}`)
      note.append(el('strong', '', types[c.type]), el('p', '', c.text)); card.append(note)
    })
    return card
  }
  function render(target, text, complete = false) {
    target.classList.add('ai-content')
    if (!window.marked || !window.DOMPurify) { target.textContent = text; return }
    const renderer = new marked.Renderer()
    renderer.html = ({text}) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const html = marked.parse(text, { renderer, gfm: true, breaks: true })
    target.innerHTML = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p','br','strong','em','del','h1','h2','h3','h4','h5','h6','ul','ol','li','blockquote','hr','table','thead','tbody','tr','th','td','pre','code','a'], ALLOWED_ATTR: ['href','title','class','start'] })
    target.querySelectorAll('a').forEach(a => {
      try { if (!['http:', 'https:', 'mailto:'].includes(new URL(a.getAttribute('href'), location.href).protocol)) a.removeAttribute('href') } catch { a.removeAttribute('href') }
      a.target = '_blank'; a.rel = 'noopener noreferrer'
    })
    target.querySelectorAll('table').forEach(table => { const wrap = el('div', 'ai-table'); wrap.tabIndex = 0; table.replaceWith(wrap); wrap.append(table) })
    target.querySelectorAll('pre code').forEach(code => {
      const raw = code.textContent
      if (code.classList.contains('language-fimap')) {
        try { code.parentElement.replaceWith(visual(JSON.parse(raw))); return } catch {
          if (!complete) { code.parentElement.replaceWith(el('p', 'ai-state', 'Organizando os dados…')); return }
          // Invalid completed blocks remain readable as code.
        }
      }
      if (complete) {
        if (window.hljs) hljs.highlightElement(code)
        code.parentElement.prepend(copy(raw, 'Copiar código'))
      }
    })
  }
  return { render, copy, visual }
})()
