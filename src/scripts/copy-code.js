const COPY_ICON = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const CHECK_ICON = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

function addCopyButtonsToCodeBlocks() {
  const codeBlocks = document.querySelectorAll('pre');

  if (!codeBlocks.length) {
    return;
  }

  codeBlocks.forEach((pre) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('code-block', 'relative', 'group');

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    // Edge fades while code is out of view on that side (styles in global.scss).
    wrapper.style.setProperty('--code-bg', getComputedStyle(pre).backgroundColor);
    const updateFades = () => {
      wrapper.classList.toggle('has-less', pre.scrollLeft > 1);
      wrapper.classList.toggle('has-more', pre.scrollLeft + pre.clientWidth < pre.scrollWidth - 1);
    };
    pre.addEventListener('scroll', updateFades, { passive: true });
    window.addEventListener('resize', updateFades);
    updateFades();

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', 'Copy code to clipboard');
    button.className = 'copy-code-button';
    button.innerHTML = COPY_ICON;
    wrapper.appendChild(button);

    // A live region: setting its text announces the outcome to screen readers too.
    const tooltip = document.createElement('div');
    tooltip.className = 'copy-tooltip copy-tooltip-hidden';
    tooltip.setAttribute('role', 'status');
    wrapper.appendChild(tooltip);

    let hideTimer;
    let clearTimer;
    const showTooltip = (text) => {
      clearTimeout(clearTimer);
      tooltip.textContent = text;
      tooltip.classList.replace('copy-tooltip-hidden', 'copy-tooltip-visible');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hideTooltip, 2000);
    };
    // The text stays through the 300 ms fade-out (.copy-tooltip in global.scss), or the bubble
    // would fade out empty, and goes after it, so the next outcome is announced again.
    const hideTooltip = () => {
      tooltip.classList.replace('copy-tooltip-visible', 'copy-tooltip-hidden');
      button.innerHTML = COPY_ICON;
      clearTimeout(clearTimer);
      clearTimer = setTimeout(() => {
        tooltip.textContent = '';
      }, 300);
    };

    button.addEventListener('click', async () => {
      const codeElement = pre.querySelector('code');
      const textToCopy = codeElement ? codeElement.innerText : pre.innerText;
      try {
        await navigator.clipboard.writeText(textToCopy);
        button.innerHTML = CHECK_ICON;
        showTooltip('Copied!');
      } catch {
        // Clipboard access can be refused (insecure context, permissions); say so instead of nothing.
        showTooltip('Copy failed');
      }
    });

    // Only a mouse leaving hides it early: on touch, the next tap anywhere else fires a
    // compatibility mouseleave that would cut the 2 s confirmation short. Leaving also ends an
    // Escape dismissal, so the next hover shows the button again.
    wrapper.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse') hideTooltip();
      wrapper.classList.remove('copy-dismissed');
    });
  });

  // Escape puts away the button of the block under the pointer (styles in global.scss).
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.code-block:hover').forEach((block) => {
      block.classList.add('copy-dismissed');
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCopyButtonsToCodeBlocks);
} else {
  addCopyButtonsToCodeBlocks();
}
