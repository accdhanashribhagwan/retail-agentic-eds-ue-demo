const LINK_TYPES = new Set(['primary', 'secondary']);
const BUTTON_PROPS = new Set(['link', 'linkText', 'linkTitle', 'linkType']);

export default async function decorate(block) {
  const picture = block.querySelector('picture') || block.querySelector('img');
  const content = document.createElement('div');
  content.classList.add('hero-content');

  // In Universal Editor (author mode) each field cell carries data-aue-prop —
  // read the four button fields directly by name when available.
  const propEl = (name) => block.querySelector(`[data-aue-prop="${name}"]`);
  const linkEl = propEl('link');
  const linkTextEl = propEl('linkText');
  const linkTitleEl = propEl('linkTitle');
  const linkTypeEl = propEl('linkType');

  const linkAnchor = linkEl && linkEl.querySelector('a[href]');
  let ctaHref = linkAnchor ? linkAnchor.getAttribute('href') : null;
  let ctaLabel = linkTextEl ? linkTextEl.textContent.trim() || null : null;
  let ctaTitle = linkTitleEl ? linkTitleEl.textContent.trim() || null : null;
  let ctaType = linkTypeEl ? linkTypeEl.textContent.trim() || null : null;
  const ctaFields = [];

  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    if (row.classList.contains('button')) return;

    [...row.querySelectorAll(':scope > div')].forEach((cell) => {
      if (cell.querySelector(':scope > picture') || cell.querySelector(':scope > img')) return;

      // Skip cells already read by data-aue-prop above
      const prop = cell.getAttribute('data-aue-prop') || row.getAttribute('data-aue-prop');
      if (prop && BUTTON_PROPS.has(prop)) return;

      const links = [...cell.querySelectorAll('a[href]')];

      // Published mode: detect link field — single <a>, no headings or lists
      if (
        ctaHref === null
        && links.length === 1
        && cell.textContent.trim() === links[0].textContent.trim()
        && !cell.querySelector('h1,h2,h3,h4,h5,h6,ul,ol')
      ) {
        ctaHref = links[0].getAttribute('href');
        return;
      }

      // Published mode: collect linkText, linkTitle, linkType (up to 3 plain-text cells after link)
      if (
        ctaHref !== null
        && ctaLabel === null
        && ctaFields.length < 3
        && !cell.querySelector('h1,h2,h3,h4,h5,h6,a[href],ul,ol,picture')
      ) {
        ctaFields.push(cell.textContent.trim());
        return;
      }

      [...cell.childNodes].forEach((node) => content.append(node));
    });
    row.remove();
  });

  // Resolve button fields from collected plain-text cells (published mode fallback).
  // Identify linkType by value since empty linkTitle rows are not rendered by AEM.
  if (ctaLabel === null) {
    ctaFields.forEach((field) => {
      if (LINK_TYPES.has(field)) {
        if (!ctaType) ctaType = field;
      } else if (ctaLabel === null) {
        ctaLabel = field;
      } else if (!ctaTitle) {
        ctaTitle = field;
      }
    });
  }

  if (ctaHref) {
    const a = document.createElement('a');
    a.href = ctaHref;
    a.textContent = ctaLabel || 'Learn More';
    if (ctaTitle) a.title = ctaTitle;
    a.classList.add('button');
    if (ctaType) a.classList.add(ctaType);
    const p = document.createElement('p');
    p.classList.add('button-wrapper');
    p.append(a);
    content.append(p);
  }

  block.querySelectorAll(':scope > .button').forEach((btn) => content.append(btn));

  if (picture) block.append(picture);
  block.append(content);
}
