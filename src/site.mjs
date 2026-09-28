export const groups = [
  {
    id: 'platform',
    title: 'Nền tảng & kiểm soát',
    description: 'Vai trò, định danh và bằng chứng',
    numbers: [1, 4, 6, 8, 9],
  },
  {
    id: 'finance',
    title: 'Dòng tiền & quyết toán',
    description: 'Giải ngân, ngân sách và phân bổ',
    numbers: [2, 3, 7, 10, 11, 12, 13, 14, 15],
  },
  {
    id: 'capital',
    title: 'Góp vốn & hợp đồng',
    description: 'Pháp lý, quyền lợi và sở hữu',
    numbers: [5, 16, 17, 18, 19, 20],
  },
  {
    id: 'operations',
    title: 'Vận hành nuôi',
    description: 'Theo dõi lô nuôi và quản trị rủi ro',
    numbers: [21, 22, 23, 24, 25, 26],
  },
  {
    id: 'commerce',
    title: 'Bán hàng & giao nhận',
    description: 'Giá bán, đơn hàng và bao tiêu',
    numbers: [27, 28, 29, 30, 31],
  },
];
export const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export const groupFor = (doc) => groups.find((g) => g.numbers.includes(Number(doc.code.slice(3))));
const arrow = '<span aria-hidden="true">↗</span>';
function header(base = '') {
  return `<header class="site-header"><a class="brand" href="${base}index.html" aria-label="CrabShare — Trang chủ"><span class="brand-mark" aria-hidden="true">CS<span>≈</span></span><span><strong>CrabShare<span class="brand-docs"> / Tài liệu</span></strong><small>Nền tảng chia sẻ doanh thu nuôi cua</small></span></a><div class="header-meta"><span class="collection-label">Tài liệu dự án</span><span>05 nhóm · 31 tài liệu</span></div></header>`;
}
function footer(base = '') {
  return `<footer class="site-footer"><a href="${base}index.html">CrabShare <span>Kho tài liệu dự án</span></a><span>31 tài liệu · TL-01 — TL-31</span></footer>`;
}
function shell(title, description, body, base = '') {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escape(description)}"><meta name="theme-color" content="#e66a26"><title>${escape(title)} | CrabShare</title><link rel="icon" href="${base}favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${base}assets/styles.css"><script src="${base}assets/app.js" defer></script></head><body><a class="skip-link" href="#main">Đến nội dung chính</a><div class="page-shell">${header(base)}${body}${footer(base)}</div></body></html>`;
}
function card(doc) {
  return `<a class="document-card" href="docs/${doc.id}.html" data-document data-group="${groupFor(doc).id}" data-search="${escape(doc.code + ' ' + doc.title + ' ' + doc.description)}"><span class="file-icon" aria-hidden="true"><span>DOC</span></span><span class="card-copy"><span class="doc-code">${doc.code}</span><h3>${escape(doc.title)}</h3><p>${escape(doc.description)}</p></span><span class="card-action">Đọc ${arrow}</span></a>`;
}
export function home(docs) {
  const highlights = [1, 2, 5, 12, 18, 23].map((n) => docs[n - 1]);
  return shell(
    'Trung tâm tài liệu',
    '31 tài liệu về nền tảng, dòng tiền, hợp đồng, vận hành nuôi và bán hàng của dự án CrabShare.',
    `<main id="main"><section class="overview" aria-labelledby="page-title"><div class="eyebrow">Tổng quan dự án</div><h1 id="page-title"><span>CrabShare</span> — Cùng nuôi, cùng chia sẻ</h1><p class="section-description">Tài liệu thiết kế và định hướng vận hành nền tảng chia sẻ doanh thu nuôi cua.</p><div class="overview-grid">${highlights.map((d) => `<a class="overview-card" href="docs/${d.id}.html"><span class="overview-number">${d.code.slice(3)}</span><span class="overview-copy"><h2>${escape(d.title)}</h2><p>${escape(groupFor(d).title)} · ${d.code}</p></span><span class="pill">Xem tài liệu ${arrow}</span></a>`).join('')}</div></section><section class="library" aria-labelledby="library-title"><div class="section-heading"><div class="eyebrow">Thư viện tài liệu</div><h2 id="library-title"><span>Hiểu hệ thống.</span> Nắm rõ cách vận hành.</h2><p class="section-description">Chọn một nhóm để xem các tài liệu tương ứng.</p></div><div class="group-tabs" role="tablist" aria-label="Nhóm tài liệu">${groups.map((g, i) => `<button type="button" class="group-tab" id="tab-${g.id}" role="tab" aria-selected="${i === 0}" aria-controls="document-panel" tabindex="${i === 0 ? 0 : -1}" data-group="${g.id}"><span class="tab-top"><span>0${i + 1}</span><span class="tab-count">${g.numbers.length} tài liệu</span></span><strong>${g.title}</strong><span class="tab-description">${g.description}</span></button>`).join('')}</div><div class="library-toolbar"><div><h3 id="group-title">Nền tảng & kiểm soát</h3><p id="result-count" aria-live="polite">5 tài liệu</p></div><label class="search"><span aria-hidden="true">⌕</span><input id="document-search" type="search" placeholder="Tìm trong 31 tài liệu…" aria-label="Tìm trong 31 tài liệu"><kbd>/</kbd></label></div><div id="document-panel" role="tabpanel" aria-labelledby="tab-platform" tabindex="0"><div class="document-grid">${docs.map(card).join('')}</div><div id="empty-state" class="empty-state" hidden><h3>Không tìm thấy tài liệu</h3><p>Thử tìm theo mã TL, tên hoặc chủ đề tài liệu.</p><button type="button" id="clear-search">Xóa tìm kiếm</button></div></div><noscript><p>JavaScript đang tắt. Tất cả 31 tài liệu được hiển thị bên dưới các nhóm.</p></noscript></section></main>`,
  );
}
export function reader(doc, docs) {
  const index = docs.indexOf(doc),
    group = groupFor(doc);
  const neighbor = (d, label) =>
    d
      ? `<a href="${d.id}.html"><small>${label} · ${d.code}</small><strong>${escape(d.title)} <span aria-hidden="true">→</span></strong></a>`
      : '<span></span>';
  return shell(
    doc.title,
    doc.description,
    `<main id="main" class="reader"><nav class="breadcrumbs" aria-label="Đường dẫn"><a href="../index.html">Thư viện</a><span>/</span><a href="../index.html#section-${group.id}">${group.title}</a><span>/</span><span aria-current="page">${doc.code}</span></nav><div class="reader-layout"><aside class="reader-sidebar"><details class="toc" open><summary>Trong tài liệu này</summary><nav aria-label="Mục lục">${doc.toc
      .filter((t) => t.level === 2)
      .map((t) => `<a href="#${t.id}">${escape(t.title)}</a>`)
      .join(
        '',
      )}</nav></details><a class="back-library" href="../index.html#section-${group.id}">← Về nhóm tài liệu</a></aside><div class="reader-main"><header class="document-heading"><div class="eyebrow">${doc.code} <span> / ${group.title}</span></div><h1>${escape(doc.title)}</h1><p>${escape(doc.description)}</p><div class="reader-actions"><a class="download-button" href="../documents/${encodeURIComponent(doc.filename)}" download>Tải bản Word <span aria-hidden="true">↓</span></a><button type="button" id="print-document">In tài liệu</button><span>${doc.toc.filter((t) => t.level === 2).length} mục</span></div></header><article class="document-content">${doc.html}</article><nav class="document-pagination" aria-label="Tài liệu liền kề">${neighbor(docs[index - 1], 'Tài liệu trước')}${neighbor(docs[index + 1], 'Tài liệu tiếp theo')}</nav></div></div></main>`,
    '../',
  );
}
