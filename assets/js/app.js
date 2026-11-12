    const siteConfig = await fetch('./assets/data/site.json').then((response) => {
  if (!response.ok) throw new Error('Unable to load site configuration.');
  return response.json();
});
const pages = siteConfig.pages.map((page) => page.id);
const announcements = await fetch('./assets/data/announcements.json').then((response) => {
  if (!response.ok) throw new Error('Unable to load announcements.');
  return response.json();
});
// Load each page as an independent HTML partial before binding page interactions.
const pageMarkup = await Promise.all(siteConfig.pages.map(async ({ id }) => {
  const response = await fetch(`./assets/pages/${id}.html`);
  if (!response.ok) throw new Error(`Unable to load page template: ${id}`);
  return response.text();
}));
const pageContainer = document.getElementById('page-container');
if (!pageContainer) throw new Error('The page container is missing.');
pageContainer.innerHTML = pageMarkup.join('\n');

    function navigateTo(pageId, targetId = null) {
      if (!pages.includes(pageId)) pageId = 'home';

      document.querySelectorAll('.page-view').forEach((el) => el.classList.remove('active'));
      const activeSection = document.getElementById('page-' + pageId);
      if (activeSection) activeSection.classList.add('active');

      document.querySelectorAll('[data-nav]').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-nav') === pageId);
      });

      document.querySelectorAll('[data-mnav]').forEach((btn) => {
        const isCurrent = btn.getAttribute('data-mnav') === pageId;
        btn.classList.toggle('font-medium', isCurrent);
        btn.classList.toggle('text-royal', isCurrent);
        btn.classList.toggle('bg-surface', isCurrent);
      });

      closeMobileMenu();

      try {
        history.replaceState(null, '', '#' + pageId);
      } catch (e) {}

      if (targetId) {
        setTimeout(() => {
          const targetEl = document.getElementById(targetId);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    function toggleMobileMenu() {
      const menu = document.getElementById('mobile-menu');
      const openIcon = document.getElementById('icon-open');
      const closeIcon = document.getElementById('icon-close');
      const btn = document.getElementById('mobile-toggle');
      const hidden = menu.classList.contains('hidden');

      menu.classList.toggle('hidden', !hidden);
      openIcon.classList.toggle('hidden', hidden);
      closeIcon.classList.toggle('hidden', !hidden);
      btn.setAttribute('aria-expanded', String(hidden));
    }

    function closeMobileMenu() {
      const menu = document.getElementById('mobile-menu');
      if (!menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
        document.getElementById('icon-open').classList.remove('hidden');
        document.getElementById('icon-close').classList.add('hidden');
        document.getElementById('mobile-toggle').setAttribute('aria-expanded', 'false');
      }
    }

    function filterNews(category) {
      document.querySelectorAll('.news-pill').forEach((btn) => {
        const active = btn.getAttribute('data-news-filter') === category;
        btn.classList.toggle('bg-navy', active);
        btn.classList.toggle('text-white', active);
        btn.classList.toggle('bg-surface', !active);
        btn.classList.toggle('text-slate-700', !active);
      });

      let visibleCount = 0;
      document.querySelectorAll('.news-item').forEach((card) => {
        const match = category === 'all' || card.getAttribute('data-cat') === category;
        card.style.display = match ? 'flex' : 'none';
        if (match) visibleCount++;
      });

      document.getElementById('news-empty').classList.toggle('hidden', visibleCount > 0);
    }

    function openNewsModal(idx) {
      const item = announcements[idx];
      if (!item) return;
      document.getElementById('modal-cat').textContent = item.category;
      document.getElementById('modal-title').textContent = item.title;
      document.getElementById('modal-body').innerHTML = item.body.map((p) => `<p>${p}</p>`).join('');
      document.getElementById('news-modal').classList.remove('hidden');
    }

    function closeNewsModal() {
      document.getElementById('news-modal').classList.add('hidden');
    }

    function submitEOI(e) {
      e.preventDefault();
      const inst = document.getElementById('eoi-inst').value.trim();
      const dept = document.getElementById('eoi-dept').value.trim();
      const country = document.getElementById('eoi-country').value.trim();
      const category = document.getElementById('eoi-category').value;
      const contact = document.getElementById('eoi-contact').value.trim();
      const email = document.getElementById('eoi-email').value.trim();
      const ref = 'TIIS-' + Math.floor(10000 + Math.random() * 90000);

      document.getElementById('eoi-ref').textContent = ref;
      document.getElementById('eoi-summary').innerHTML = `
        <div><strong>Institution:</strong> ${escapeHtml(inst)}</div>
        <div><strong>Faculty / Department:</strong> ${escapeHtml(dept)}</div>
        <div><strong>Country:</strong> ${escapeHtml(country)}</div>
        <div><strong>Category:</strong> ${escapeHtml(category)}</div>
        <div><strong>Contact:</strong> ${escapeHtml(contact)} (${escapeHtml(email)})</div>
      `;

      document.getElementById('eoi-form').classList.add('hidden');
      document.getElementById('eoi-confirmation').classList.remove('hidden');
    }

    function resetEOI() {
      document.getElementById('eoi-form').reset();
      document.getElementById('eoi-confirmation').classList.add('hidden');
      document.getElementById('eoi-form').classList.remove('hidden');
    }

    function submitInquiry(e) {
      e.preventDefault();
      const ref = 'INQ-' + Math.floor(10000 + Math.random() * 90000);
      document.getElementById('inq-ref').textContent = ref;
      document.getElementById('inquiry-form').classList.add('hidden');
      document.getElementById('inquiry-confirmation').classList.remove('hidden');
    }

    function resetInquiry() {
      document.getElementById('inquiry-form').reset();
      document.getElementById('inquiry-confirmation').classList.add('hidden');
      document.getElementById('inquiry-form').classList.remove('hidden');
    }

    function copyEmail() {
      const input = document.createElement('input');
      input.value = 'info@tiis-consortium.org';
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand('copy');
      } catch (err) {}
      document.body.removeChild(input);
    }

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // Preserve compatibility with inline event handlers in the page markup.
    Object.assign(window, {
      navigateTo, toggleMobileMenu, closeMobileMenu, filterNews,
      openNewsModal, closeNewsModal, submitEOI, resetEOI,
      submitInquiry, resetInquiry, copyEmail,
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeNewsModal();
        closeMobileMenu();
      }
    });

    window.addEventListener('DOMContentLoaded', () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (pages.includes(hash)) navigateTo(hash);
    });