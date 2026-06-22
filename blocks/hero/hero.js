const LINK_TYPES = new Set(['primary', 'secondary']);

export default async function decorate(block) {
  // picture may render as <picture> or bare <img> depending on AEM image state
  const picture = block.querySelector('picture') || block.querySelector('img');

  const content = document.createElement('div');
  content.classList.add('hero-content');

  let ctaHref = null;
  const ctaFields = []; // plain-text cells collected after the link field

  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    if (row.classList.contains('button')) return;

    [...row.querySelectorAll(':scope > div')].forEach((cell) => {
      // Skip the image cell
      if (cell.querySelector(':scope > picture') || cell.querySelector(':scope > img')) return;

      const links = [...cell.querySelectorAll('a[href]')];

      // Detect the link (aem-content) field:
      // cell contains only a single <a>, no headings or lists
      if (
        links.length === 1
        && cell.textContent.trim() === links[0].textContent.trim()
        && !cell.querySelector('h1,h2,h3,h4,h5,h6,ul,ol')
      ) {
        ctaHref = links[0].getAttribute('href');
        return;
      }

      // Collect button fields (linkText, linkTitle, linkType) — up to 3 plain-text
      // cells that follow the link field
      if (
        ctaHref !== null
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

  if (ctaHref) {
    // Identify fields by value, not position — linkTitle may be absent (empty fields
    // are not rendered by AEM, which shifts the positional index)
    let ctaLabel = null;
    let ctaTitle = null;
    let ctaType = null;

    ctaFields.forEach((field) => {
      if (LINK_TYPES.has(field)) {
        ctaType = field;
      } else if (ctaLabel === null) {
        ctaLabel = field;
      } else {
        ctaTitle = field;
      }
    });

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

  // Move any UE-injected button child blocks into the content area
  block.querySelectorAll(':scope > .button').forEach((btn) => content.append(btn));

  if (picture) block.append(picture);
  block.append(content);
}
