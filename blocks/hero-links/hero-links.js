export default async function decorate(block) {
  const rows = [...block.children];
  const list = document.createElement('ul');
  list.classList.add('hero-links-list');

  rows.forEach((row) => {
    const cells = [...row.children];
    const li = document.createElement('li');
    li.classList.add('hero-links-item');

    // Cell 0: icon image (authored as an image reference)
    const iconCell = cells[0];
    if (iconCell) {
      const iconWrapper = document.createElement('span');
      iconWrapper.classList.add('hero-links-icon');
      [...iconCell.childNodes].forEach((node) => iconWrapper.append(node));
      li.append(iconWrapper);
    }

    // Cell 1: label text or link
    const labelCell = cells[1];
    if (labelCell) {
      const label = document.createElement('span');
      label.classList.add('hero-links-label');
      [...labelCell.childNodes].forEach((node) => label.append(node));
      li.append(label);
    }

    list.append(li);
    row.remove();
  });

  block.append(list);
}
