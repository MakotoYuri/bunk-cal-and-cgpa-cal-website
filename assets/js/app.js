/* ============================================
   COLLEGE TOOLKIT — Consolidated App Logic
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);
  const html = document.documentElement;

  // --- Toast helper ---
  const toast = (() => {
    const el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
    let t;
    return msg => {
      el.textContent = msg;
      el.classList.add('show');
      clearTimeout(t);
      t = setTimeout(() => el.classList.remove('show'), 2600);
    };
  })();

  // ========================
  //  1. ROUTING
  // ========================
  const headerTitle = $('header-title');
  const headerSub = $('header-subtitle');
  const pages = $$('.page');
  const navLinks = $$('.nav-link');

  const titles = {
    '#home':  ['Attendance Calculator', 'Know your bunk budget 😎'],
    '#cgpa':  ['SGPA & CGPA', 'Track your academic score 📊'],
    '#about': ['About App', 'Help & info ℹ️']
  };

  function route() {
    const hash = location.hash || '#home';
    pages.forEach(p => p.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));
    const page = $(`page-${hash.substring(1)}`);
    const link = document.querySelector(`.nav-link[href="${hash}"]`);
    if (page) page.classList.add('active');
    if (link) link.classList.add('active');
    const [t, s] = titles[hash] || titles['#home'];
    headerTitle.textContent = t;
    headerSub.textContent = s;
  }
  addEventListener('hashchange', route);
  route();

  // ========================
  //  2. THEME & APPEARANCE
  // ========================
  const moonPath = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
  const sunPath = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';

  // Restore saved preferences
  const saved = k => localStorage.getItem(k);
  if (saved('theme')) html.setAttribute('data-theme', saved('theme'));
  if (saved('color')) { html.setAttribute('data-color', saved('color')); $('theme-selector').value = saved('color'); }

  // Apply correct icon on load
  $('theme-icon').innerHTML = html.getAttribute('data-theme') === 'dark' ? sunPath : moonPath;

  $('theme-toggle').addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    $('theme-icon').innerHTML = isDark ? moonPath : sunPath;
    localStorage.setItem('theme', next);
    toast(isDark ? '☀️ Light mode' : '🌙 Dark mode');
  });

  $('theme-selector').addEventListener('change', e => {
    html.setAttribute('data-color', e.target.value);
    localStorage.setItem('color', e.target.value);
  });

  // ========================
  //  3. ATTENDANCE CALCULATOR
  // ========================
  let attTarget = 75;
  const heldInput = $('classes-held');
  const attInput = $('classes-attended');
  const attResults = $('results-container');
  const attPercent = $('current-percentage');
  const reqMsg = $('required-classes-msg');
  const bunkMsg = $('bunkable-classes-msg');

  // Target chips
  $$('.chip[data-target]').forEach(chip => {
    chip.addEventListener('click', e => {
      $$('.chip[data-target]').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      attTarget = +e.target.dataset.target;
      if (heldInput.value && attInput.value) calcAttendance();
    });
  });

  function calcAttendance() {
    const H = +heldInput.value, A = +attInput.value;
    if (H <= 0 || A < 0 || A > H) return toast('⚠️ Enter valid numbers');

    const pct = (A / H) * 100;
    attPercent.textContent = `${pct.toFixed(2)}%`;
    attResults.classList.remove('hidden');

    const T = attTarget;
    const req = Math.ceil((T * H - 100 * A) / (100 - T));
    const bunk = Math.floor((100 * A - T * H) / T);

    reqMsg.classList.remove('success');
    if (pct >= T) {
      reqMsg.textContent = `🎉 Target ${T}% achieved!`;
      reqMsg.classList.add('success');
      if (bunk > 0) {
        bunkMsg.textContent = `You can skip ${bunk} class${bunk > 1 ? 'es' : ''} safely 🎯`;
        bunkMsg.style.display = 'block';
      } else {
        bunkMsg.style.display = 'none';
      }
    } else {
      reqMsg.textContent = `📚 Attend ${req} more class${req > 1 ? 'es' : ''} to reach ${T}%`;
      bunkMsg.style.display = 'none';
    }
  }

  $('calc-btn').addEventListener('click', calcAttendance);

  // Enter key support for attendance
  [heldInput, attInput].forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') calcAttendance(); });
  });

  // ========================
  //  4. SGPA/CGPA CALCULATOR
  // ========================
  let semCount = 1;
  const semList = $('semester-list');

  function renderSemesters() {
    semList.innerHTML = '';
    for (let i = 1; i <= semCount; i++) {
      const div = document.createElement('div');
      div.className = 'input-group';
      div.innerHTML = `
        <label>Semester ${i} SGPA</label>
        <div class="sem-row">
          <input type="number" class="sgpa-input" min="0" max="10" step="0.01" placeholder="e.g. 8.5" data-i="${i}">
          ${i > 1
            ? `<button class="icon-btn remove-sem-btn" aria-label="Remove" data-i="${i}">
                 <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
               </button>`
            : '<div style="width:36px"></div>'}
        </div>`;
      semList.appendChild(div);
    }
    $$('.remove-sem-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (semCount > 1) { semCount--; renderSemesters(); $('cgpa-results').classList.add('hidden'); }
      });
    });
  }

  $('add-sem-btn').addEventListener('click', () => {
    semCount++;
    renderSemesters();
    $('cgpa-results').classList.add('hidden');
  });

  $('calc-cgpa-btn').addEventListener('click', () => {
    const inputs = $$('.sgpa-input');
    let sum = 0;
    for (const inp of inputs) {
      const v = parseFloat(inp.value);
      if (isNaN(v) || v < 0 || v > 10) return toast('⚠️ Enter valid SGPA (0–10)');
      sum += v;
    }
    const cgpa = sum / semCount;
    $('final-cgpa').textContent = cgpa.toFixed(2);
    $('final-percentage').textContent = `${(cgpa * 10).toFixed(2)}%`;
    $('cgpa-results').classList.remove('hidden');
  });

  renderSemesters();

  // ========================
  //  5. SERVICE WORKER
  // ========================
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
});
