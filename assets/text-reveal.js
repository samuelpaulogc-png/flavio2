(() => {
  const section = document.querySelector('[data-text-reveal-section]');
  const blocks = [...document.querySelectorAll('[data-text-reveal]')];
  if (!section || !blocks.length) return;

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const chars = [];

  blocks.forEach(block => {
    const label = block.textContent.replace(/\s+/g, ' ').trim();
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).filter(Boolean).forEach(part => {
        if (/^\s+$/.test(part)) { fragment.append(document.createTextNode(part)); return; }
        const word = document.createElement('span');
        word.dataset.revealWord = '';
        word.setAttribute('aria-hidden', 'true');
        Array.from(part).forEach(letter => {
          const char = document.createElement('span');
          char.dataset.revealChar = '';
          char.textContent = letter;
          chars.push(char);
          word.append(char);
        });
        fragment.append(word);
      });
      node.replaceWith(fragment);
    });
    block.setAttribute('aria-label', label);
  });

  let queued = false;
  function update() {
    queued = false;
    if (preference.matches) {
      blocks.forEach(block => block.classList.remove('text-reveal-active'));
      return;
    }
    const first = blocks[0].getBoundingClientRect();
    const last = blocks[blocks.length - 1].getBoundingClientRect();
    const height = Math.max(1, last.bottom - first.top);
    const stage = section.querySelector('.about-stage');
    const travel = stage ? Math.max(1, section.offsetHeight - stage.offsetHeight) : 1;
    const progress = section.hasAttribute('data-text-reveal-pin') && stage
      ? Math.max(0, Math.min(1, -section.getBoundingClientRect().top / travel))
      : Math.max(0, Math.min(1, (innerHeight * .85 - first.top) / (innerHeight * .55 + height)));
    const lit = Math.round(progress * chars.length);
    chars.forEach((char, i) => char.classList.toggle('is-lit', i < lit));
    blocks.forEach(block => block.classList.add('text-reveal-active'));
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  preference.addEventListener('change', schedule);
  update();
})();
