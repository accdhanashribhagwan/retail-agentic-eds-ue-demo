export default async function decorate(block) {
  const picture = block.querySelector('picture');

  const content = document.createElement('div');
  content.classList.add('hero-content');

  let ctaHref = null;
  const ctaFields = []; // collected in model order: linkText, linkTitle, linkType

  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    if (row.classList.contains('button')) return;

    [...row.querySelectorAll(':scope > div')].forEach((cell) => {
      if (cell.querySelector(':scope > picture')) return;

      const links = [...cell.querySelectorAll('a[href]')];

      // Detect link (aem-content) field: cell contains only a single <a>, no headings or lists
      if (
        links.length === 1
        && cell.textContent.trim() === links[0].textContent.trim()
        && !cell.querySelector('h1,h2,h3,h4,h5,h6,ul,ol')
      ) {
        ctaHref = links[0].href;
        return;
      }

      // Collect linkText, linkTitle, linkType — plain-text cells after the link field (up to 3)
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
    const [ctaLabel, ctaTitle, ctaType] = ctaFields;
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
