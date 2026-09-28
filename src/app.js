const tabs = [...document.querySelectorAll('[role="tab"]')];
const cards = [...document.querySelectorAll('[data-document]')];
const search = document.querySelector('#document-search');
const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
if (tabs.length) {
  const title = document.querySelector('#group-title');
  const count = document.querySelector('#result-count');
  const panel = document.querySelector('#document-panel');
  let active = tabs[0].dataset.group;
  function render() {
    const query = normalize(search.value.trim());
    let matches = 0;
    tabs.forEach((tab) => {
      const selected = tab.dataset.group === active;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    cards.forEach((card) => {
      const visible = query
        ? normalize(card.dataset.search).includes(query)
        : card.dataset.group === active;
      card.hidden = !visible;
      if (visible) matches++;
    });
    title.textContent = query
      ? 'Kết quả tìm kiếm'
      : tabs.find((t) => t.dataset.group === active).querySelector('strong').textContent;
    count.textContent = query ? `${matches} / 31 tài liệu` : `${matches} tài liệu`;
    panel.setAttribute('aria-labelledby', query ? 'group-title' : `tab-${active}`);
    document.querySelector('#empty-state').hidden = matches !== 0;
  }
  function fromHash() {
    const group = location.hash.replace('#section-', '');
    if (tabs.some((t) => t.dataset.group === group)) {
      active = group;
      search.value = '';
    }
    render();
  }
  function select(tab) {
    active = tab.dataset.group;
    search.value = '';
    history.pushState(null, '', `#section-${active}`);
    render();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        tabs[next].focus();
        select(tabs[next]);
      }
    });
  });
  search.addEventListener('input', render);
  document.querySelector('#clear-search').addEventListener('click', () => {
    search.value = '';
    render();
    search.focus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      search.focus();
    }
    if (event.key === 'Escape' && document.activeElement === search) {
      search.value = '';
      render();
      search.blur();
    }
  });
  addEventListener('hashchange', fromHash);
  fromHash();
  if (tabs.some((tab) => location.hash === `#section-${tab.dataset.group}`)) {
    document.querySelector('.library').scrollIntoView();
  }
}
document.querySelector('#print-document')?.addEventListener('click', () => window.print());
const headings = [...document.querySelectorAll('.document-content h2')];
if (headings.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const current = entries.find((entry) => entry.isIntersecting);
      if (!current) return;
      document.querySelectorAll('.toc a').forEach((link) => {
        if (link.hash === `#${current.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    },
    { rootMargin: '-10% 0px -65% 0px' },
  );
  headings.forEach((h) => observer.observe(h));
}
