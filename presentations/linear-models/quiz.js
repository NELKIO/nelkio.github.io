// Быстрые опросы: таймер, выбор варианта, показ ответа.
(function () {
  const h = window.LMP.h;
  document.querySelectorAll('.quiz').forEach(q => {
    const secs = +q.dataset.time || 30, right = +q.dataset.answer;
    const head = h('div', { class: 'quiz-head' });
    h('span', { class: 'quiz-tag' }, head, q.dataset.tag || 'Быстрый опрос');
    const bar = h('i', {}, h('div', { class: 'quiz-timer' }, head));
    const clock = h('span', { class: 'quiz-clock' }, head, secs + ' с');
    q.prepend(head);
    const opts = [...q.querySelectorAll('.quiz-options button')];
    opts.forEach((b, i) => {
      b.dataset.key = 'ABCD'[i];
      if (i === right) b.classList.add('right');
      b.addEventListener('click', () => { opts.forEach(o => o.classList.remove('picked')); b.classList.add('picked'); });
    });
    const actions = h('div', { class: 'quiz-actions' });
    q.insertBefore(actions, q.querySelector('.quiz-why'));
    let timer = null, left = secs;
    const stop = () => { clearInterval(timer); timer = null; };
    const show = () => { clock.textContent = left + ' с'; bar.style.transform = `scaleX(${left / secs})`; };
    const start = h('button', { type: 'button', class: 'primary' }, actions, 'Запустить таймер');
    start.addEventListener('click', () => {
      stop(); left = secs; q.classList.remove('revealed'); show();
      timer = setInterval(() => { left--; show(); if (left <= 0) stop(); }, 1000);
    });
    h('button', { type: 'button' }, actions, 'Показать ответ').addEventListener('click', () => { stop(); q.classList.toggle('revealed'); });
  });
})();
