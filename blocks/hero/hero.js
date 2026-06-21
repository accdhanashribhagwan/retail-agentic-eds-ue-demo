export default async function decorate(block) {
  // Pull picture out to be a direct child of .hero for CSS absolute positioning
  const picture = block.querySelector('picture');

  // Collect all non-picture content into a single content wrapper
  const content = document.createElement('div');
  content.classList.add('hero-content');

  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    // Skip nested button blocks that UE may inject as child components
    if (row.classList.contains('button')) return;

    [...row.querySelectorAll(':scope > div')].forEach((cell) => {
      if (cell.querySelector(':scope > picture')) return;
      [...cell.childNodes].forEach((node) => content.append(node));
    });
    row.remove();
  });

  // Move any UE-injected button child blocks into the content area
  block.querySelectorAll(':scope > .button').forEach((btn) => {
    content.append(btn);
  });

  if (picture) block.append(picture);
  block.append(content);
}
