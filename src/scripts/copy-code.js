function addCopyButtonsToCodeBlocks() {
  const codeBlocks = document.querySelectorAll('pre');

  if (!codeBlocks.length) {
    return;
  }

  codeBlocks.forEach((pre) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('relative', 'group');

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', 'Copy code to clipboard');
    button.className = 'copy-code-button opacity-0 group-hover:opacity-100 transition-opacity';
    button.innerHTML = '📋';
    wrapper.appendChild(button);

    const tooltip = document.createElement('div');
    tooltip.className = 'copy-tooltip copy-tooltip-hidden';
    tooltip.innerText = 'Copied!';
    wrapper.appendChild(tooltip);

    button.addEventListener('click', async () => {
      try {
        const codeElement = pre.querySelector('code');
        const textToCopy = codeElement ? codeElement.innerText : pre.innerText;
        await navigator.clipboard.writeText(textToCopy);

        button.innerText = '✅';
        tooltip.classList.remove('copy-tooltip-hidden');
        tooltip.classList.add('copy-tooltip-visible');

        setTimeout(() => {
          button.innerHTML = '📋';
          tooltip.classList.remove('copy-tooltip-visible');
          tooltip.classList.add('copy-tooltip-hidden');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    });

    wrapper.addEventListener('mouseleave', () => {
      tooltip.classList.remove('copy-tooltip-visible');
      tooltip.classList.add('copy-tooltip-hidden');
      button.innerHTML = '📋';
    });
  });
}

// Esperar a que el DOM esté realmente cargado antes de ejecutar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCopyButtonsToCodeBlocks);
} else {
  addCopyButtonsToCodeBlocks();
}
