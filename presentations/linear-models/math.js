window.renderMath = (root=document) => {
  root.querySelectorAll('[data-tex]').forEach(el => katex.render(el.dataset.tex,el,{throwOnError:true,displayMode:el.hasAttribute('data-display')}));
};
window.renderMath();
