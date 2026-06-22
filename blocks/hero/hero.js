export default async function decorate(block) {
  const picture = block.querySelector('picture');

  const content = document.createElement('div');
  content.classList.add('hero-content');

  let ctaHref = null;
  let ctaLabel = null;

  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    if (row.classList.contains('button')) return;

    [...row.querySelectorAll(':scope > div')].forEach((cell) => {
      if (cell.querySelector(':scope > picture')) return;

      const links = [...cell.querySelectorAll('a[href]')];
      // Detect the link (aem-content) field: cell contains only a single <a>, no headings/lists
      if (
        links.length === 1
        && cell.textContent.trim() === links[0].textContent.trim()
        && !cell.querySelector('h1,h2,h3,h4,h5,h6,ul,ol')
      ) {
        ctaHref = links[0].href;
        return;
      }

      // Detect the linkText (text) field: plain-text cell immediately following the link field
      if (
        ctaHref !== null
        && ctaLabel === null
        && !cell.querySelector('h1,h2,h3,h4,h5,h6,a[href],ul,ol,picture')
        && cell.textContent.trim()
      ) {
        ctaLabel = cell.textContent.trim();
        return;
      }

      [...cell.childNodes].forEach((node) => content.append(node));
    });
    row.remove();
  });

  if (ctaHref) {
    const a = document.createElement('a');
    a.href = ctaHref;
    a.textContent = ctaLabel || 'Learn More';
    a.classList.add('button', 'primary');
    const p = document.createElement('p');
    p.classList.add('button-wrapper');
    p.append(a);
    content.append(p);
  }

  block.querySelectorAll(':scope > .button').forEach((btn) => content.append(btn));

  if (picture) block.append(picture);
  block.append(content);
}
