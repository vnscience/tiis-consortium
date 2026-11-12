const siteConfig = await fetch('./assets/data/site.json').then((response) => {
  if (!response.ok) throw new Error('Unable to load site configuration.');
  return response.json();
});
const pages = siteConfig.pages.map((page) => page.id);
const [announcements, stories] = await Promise.all([
  fetch('./assets/data/announcements.json').then((response) => {
    if (!response.ok) throw new Error('Unable to load announcements.');
    return response.json();
  }),
  fetch('./assets/data/stories.json').then((response) => {
    if (!response.ok) throw new Error('Unable to load stories.');
    return response.json();
  })
]);

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
  if (!pages.includes(pageId) && pageId !== 'article') pageId = 'home';

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
    btn.classList.toggle('active', isCurrent);
  });

  closeMobileMenu();
  const hash = pageId === 'article' && window.currentStorySlug
    ? `#article/${window.currentStorySlug}`
    : `#${pageId}`;
  try { history.replaceState(null, '', hash); } catch (error) {}
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
  if (!menu) return;
  if (menu.classList.contains('is-open')) closeMobileMenu();
  else openMobileMenu();
}

function openMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('menu-backdrop');
  const toggle = document.getElementById('mobile-toggle');
  if (!menu || !backdrop) return;
  menu.hidden = false;
  backdrop.hidden = false;
  document.getElementById('icon-open')?.classList.add('hidden');
  document.getElementById('icon-close')?.classList.remove('hidden');
  menu.removeAttribute('inert');
  menu.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    backdrop.classList.add('is-visible');
    menu.classList.add('is-open');
  });
  document.body.classList.add('menu-open');
  toggle?.setAttribute('aria-expanded', 'true');
  toggle?.setAttribute('aria-label', 'Close navigation menu');
  document.getElementById('menu-close')?.focus();
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('menu-backdrop');
  const toggle = document.getElementById('mobile-toggle');
  if (!menu || !menu.classList.contains('is-open')) return;
  menu.classList.remove('is-open');
  backdrop?.classList.remove('is-visible');
  menu.setAttribute('aria-hidden', 'true');
  menu.setAttribute('inert', '');
  document.body.classList.remove('menu-open');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Open navigation menu');
  document.getElementById('icon-open')?.classList.remove('hidden');
  document.getElementById('icon-close')?.classList.add('hidden');
  window.setTimeout(() => {
    if (!menu.classList.contains('is-open')) {
      menu.hidden = true;
      if (backdrop) backdrop.hidden = true;
    }
  }, 300);
  toggle?.focus();
}

function storyCard(story) {
  return `
    <article class="story-card news-item" data-cat="${escapeHtml(story.category)}">
      <a href="#article/${encodeURIComponent(story.id)}" class="story-card-image-link" onclick="openArticle('${escapeHtml(story.id)}'); return false;" aria-label="Read ${escapeHtml(story.title)}">
        <img class="story-card-image" src="${escapeHtml(story.coverImage || './assets/images/placeholders/tiis-event-placeholder.svg')}" alt="${escapeHtml(story.imageAlt || story.title)}" loading="lazy">
      </a>
      <div class="story-card-content">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <span class="story-category">${escapeHtml(story.category)}</span>
          <span class="story-date">${escapeHtml(story.dateLabel || '')}</span>
        </div>
        <h3 class="story-card-title">${escapeHtml(story.title)}</h3>
        <p class="story-card-excerpt">${escapeHtml(story.excerpt)}</p>
        <div class="story-card-footer">
          <span>${escapeHtml(story.readingTime || '3 min read')}</span>
          <button type="button" onclick="openArticle('${escapeHtml(story.id)}')" class="story-read-link">Read story <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </article>`;
}

function renderStories() {
  const newsList = document.getElementById('news-list');
  if (newsList) newsList.innerHTML = stories.map(storyCard).join('');
  const activityList = document.getElementById('activity-stories');
  if (activityList) {
    const activityStories = stories.filter((story) =>
      ['Academic Events', 'International Collaboration'].includes(story.category)
    );
    activityList.innerHTML = activityStories.slice(0, 3).map(storyCard).join('');
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
  document.querySelectorAll('#news-list .news-item').forEach((card) => {
    const match = category === 'all' || card.getAttribute('data-cat') === category;
    card.hidden = !match;
    if (match) visibleCount++;
  });
  const empty = document.getElementById('news-empty');
  if (empty) empty.classList.toggle('hidden', visibleCount > 0);
}

function renderArticleBlock(block) {
  if (block.type === 'heading') return `<h2>${escapeHtml(block.text)}</h2>`;
  if (block.type === 'image') return `
    <figure class="article-figure">
      <img src="${escapeHtml(block.src || './assets/images/placeholders/tiis-event-placeholder.svg')}" alt="${escapeHtml(block.alt || '')}" loading="lazy">
      ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}
    </figure>`;
  if (block.type === 'quote') return `<blockquote class="article-quote">${escapeHtml(block.text)}</blockquote>`;
  return `<p>${escapeHtml(block.text || '')}</p>`;
}

function openArticle(slug) {
  const story = stories.find((item) => item.id === slug);
  if (!story) return;
  let articlePage = document.getElementById('page-article');
  if (!articlePage) {
    articlePage = document.createElement('section');
    articlePage.id = 'page-article';
    articlePage.className = 'page-view';
    pageContainer.appendChild(articlePage);
  }
  window.currentStorySlug = story.id;
  articlePage.innerHTML = `
    <article class="article-page">
      <div class="article-hero">
        <div class="article-hero-inner">
          <button type="button" class="article-back-link" onclick="navigateTo('news')">← Back to News &amp; Updates</button>
          <div class="story-category">${escapeHtml(story.category)}</div>
          <h1>${escapeHtml(story.title)}</h1>
          <div class="article-meta">${escapeHtml(story.dateLabel || '')} <span aria-hidden="true">·</span> ${escapeHtml(story.readingTime || '3 min read')}</div>
        </div>
      </div>
      <div class="article-layout">
        <img class="article-cover" src="${escapeHtml(story.coverImage || './assets/images/placeholders/tiis-event-placeholder.svg')}" alt="${escapeHtml(story.imageAlt || story.title)}">
        <div class="article-content">
          ${(story.sections || []).map(renderArticleBlock).join('')}
          <div class="article-endnote">
            <strong>TIIS Consortium</strong>
            <p>Connecting Institutions. Advancing Computing. Shaping the Future.</p>
          </div>
          <button type="button" class="article-back-bottom" onclick="navigateTo('news')">← Return to all stories</button>
        </div>
      </div>
    </article>`;
  navigateTo('article');
}

function openNewsModal(idx) {
  const item = announcements[idx];
  if (!item) return;
  const story = stories.find((entry) => entry.title === item.title);
  if (story) return openArticle(story.id);
  const modal = document.getElementById('news-modal');
  if (!modal) return;
  document.getElementById('modal-cat').textContent = item.category;
  document.getElementById('modal-title').textContent = item.title;
  document.getElementById('modal-body').innerHTML = item.body.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  modal.classList.remove('hidden');
}

function closeNewsModal() {
  const modal = document.getElementById('news-modal');
  if (modal) modal.classList.add('hidden');
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
    <div><strong>Contact:</strong> ${escapeHtml(contact)} (${escapeHtml(email)})</div>`;
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
  try { document.execCommand('copy'); } catch (error) {}
  document.body.removeChild(input);
}
function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = String(value ?? '');
  return div.innerHTML.replace(/\"/g, '&quot;').replace(/'/g, '&#39;');
}

renderStories();
Object.assign(window, {
  navigateTo, toggleMobileMenu, closeMobileMenu, filterNews, openArticle,
  openNewsModal, closeNewsModal, submitEOI, resetEOI,
  submitInquiry, resetInquiry, copyEmail
});
document.getElementById('menu-backdrop')?.addEventListener('click', closeMobileMenu);
document.addEventListener('keydown', (event) => {
  const menu = document.getElementById('mobile-menu');
  if (event.key === 'Tab' && menu?.classList.contains('is-open')) {
    const focusable = [...menu.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  if (event.key === 'Escape') {
    closeNewsModal();
    closeMobileMenu();
  }
});
// ES modules with top-level await may resume after DOMContentLoaded has
// already fired. Initialize the first view immediately instead of waiting
// for that event; otherwise the page container remains empty until a user
// clicks a navigation control.
function initializeRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('article/')) {
    openArticle(decodeURIComponent(hash.slice(8)));
  } else {
    navigateTo(pages.includes(hash) ? hash : 'home');
  }
}

initializeRoute();
