const STORAGE_KEY_SNOW = 'flavortown_snow_disabled';
const STORAGE_KEY_DEDUP = 'flavortown_dedup_attachments';
const STORAGE_KEY_DEVLOG_PERF = 'flavortown_optimize_devlogs';
const STORAGE_KEY_EXTREME_PERF = 'flavortown_extreme_perf';
const API_KEY = 'ft_sk_fc84422369ace7924cc058a17ae33c548864fe6d';

let snowDisabled = localStorage.getItem(STORAGE_KEY_SNOW) === 'true';
let dedupEnabled = localStorage.getItem(STORAGE_KEY_DEDUP) === 'true';
let devlogPerfEnabled = localStorage.getItem(STORAGE_KEY_DEVLOG_PERF) === 'true';
let extremePerfEnabled = localStorage.getItem(STORAGE_KEY_EXTREME_PERF) === 'true';

function init() {
    toggleSnow(snowDisabled);
    optimizeShop();
    optimizeDevlogs(devlogPerfEnabled);
    applyExtremePerf(extremePerfEnabled);
    modifyExploreNav();

    if (document.body) {
        startObserver();
        injectSettingsUI();
        dedupAttachments();
        modifyExploreNav();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            startObserver();
            injectSettingsUI();
            dedupAttachments();
            modifyExploreNav();
        });
    }
}

function startObserver() {
    const observer = new MutationObserver(() => {
        injectSettingsUI();
        optimizeShop();
        optimizeDevlogs(devlogPerfEnabled);
        applyExtremePerf(extremePerfEnabled);
        dedupAttachments();

        if (snowDisabled && document.body && document.body.getAttribute('data-controller') === 'snow') {
            document.body.removeAttribute('data-controller');
        }
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    }
}

function toggleSnow(disable) {
    snowDisabled = disable;
    localStorage.setItem(STORAGE_KEY_SNOW, disable);

    if (disable) {
        if (document.body && document.body.getAttribute('data-controller') === 'snow') {
            document.body.removeAttribute('data-controller');
        }

        const styles = document.createElement('style');
        styles.id = 'flavortown-no-snow-style';
        styles.textContent = `
            .snow-layer, 
            .falling-snow-container, 
            .sidebar__user-avatar-santa-hat {
                display: none !important;
            }
        `;
        const head = document.head || document.documentElement;
        if (head && !document.getElementById('flavortown-no-snow-style')) {
            head.appendChild(styles);
        }
    } else {
        if (document.body) {
            document.body.setAttribute('data-controller', 'snow');
        }
        const style = document.getElementById('flavortown-no-snow-style');
        if (style) style.remove();
    }
}

function dedupAttachments() {
    if (!dedupEnabled) return;

    const tracks = document.querySelectorAll('.post__attachments .post__track');
    tracks.forEach(track => {
        const seen = new Set();
        const slides = Array.from(track.querySelectorAll('.post__slide'));
        const indicatorsParams = track.parentElement.querySelector('.post__indicators');
        const indicators = indicatorsParams ? Array.from(indicatorsParams.querySelectorAll('.post__dot')) : [];
        let removedIndices = [];

        slides.forEach((slide, index) => {
            const media = slide.querySelector('img, video');
            if (media && media.src) {
                try {
                    const filename = decodeURIComponent(media.src.split('/').pop().split('?')[0]);
                    if (seen.has(filename)) {
                        slide.remove();
                        removedIndices.push(index);
                    } else {
                        seen.add(filename);
                    }
                } catch (e) { }
            }
        });

        if (removedIndices.length > 0 && indicators.length > 0) {
            removedIndices.reverse().forEach(index => {
                if (indicators[index]) indicators[index].remove();
            });

            const remainingDots = indicatorsParams.querySelectorAll('.post__dot');
            remainingDots.forEach((dot, newIndex) => {
                dot.setAttribute('data-index', newIndex);
            });

            if (track.parentElement.querySelector('.post__dot.is-active') === null && remainingDots.length > 0) {
                remainingDots[0].classList.add('is-active');
            }
        }

        const remainingSlides = track.querySelectorAll('.post__slide');
        if (remainingSlides.length <= 1) {
            const viewport = track.closest('.post__viewport');
            if (viewport) {
                const prevBtn = viewport.querySelector('.post__chevron--prev');
                const nextBtn = viewport.querySelector('.post__chevron--next');
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'none';
            }
        }
    });
}

function injectSettingsUI() {
    const form = document.querySelector('#settings-form');
    if (!form) return;

    if (!document.getElementById('flavortown-snow-toggle')) {
        const div = document.createElement('div');
        div.className = 'settings-form__field';
        div.innerHTML = `
            <label class="settings-form__checkbox">
              <input type="checkbox" id="flavortown-snow-toggle" ${snowDisabled ? 'checked' : ''}>
              <span>Disable Snow Effects</span>
            </label>
            <small class="settings-form__hint">Reduces lag by finding the off switch for the snow machine.</small>
        `;
        const lastField = Array.from(form.querySelectorAll('.settings-form__field')).pop();
        if (lastField) lastField.after(div);
        else form.prepend(div);

        div.querySelector('#flavortown-snow-toggle').addEventListener('change', (e) => {
            toggleSnow(e.target.checked);
        });
    }

    if (!document.getElementById('flavortown-dedup-toggle')) {
        const div = document.createElement('div');
        div.className = 'settings-form__field';
        div.innerHTML = `
            <label class="settings-form__checkbox">
              <input type="checkbox" id="flavortown-dedup-toggle" ${dedupEnabled ? 'checked' : ''}>
              <span>Hide Duplicate Attachments</span>
            </label>
            <small class="settings-form__hint">Fixes the bug where images and videos appear twice in devlogs.</small>
        `;
        const lastField = Array.from(form.querySelectorAll('.settings-form__field')).pop();
        if (lastField) lastField.after(div);
        else form.prepend(div);

        div.querySelector('#flavortown-dedup-toggle').addEventListener('change', (e) => {
            dedupEnabled = e.target.checked;
            localStorage.setItem(STORAGE_KEY_DEDUP, dedupEnabled);
            if (dedupEnabled) dedupAttachments();
        });
    }

    if (!document.getElementById('flavortown-devlog-perf-toggle')) {
        const div = document.createElement('div');
        div.className = 'settings-form__field';
        div.innerHTML = `
            <label class="settings-form__checkbox">
              <input type="checkbox" id="flavortown-devlog-perf-toggle" ${devlogPerfEnabled ? 'checked' : ''}>
              <span>Optimize Devlog Feed</span>
            </label>
            <small class="settings-form__hint">Improves scrolling by lazy-rendering posts.</small>
        `;
        const lastField = Array.from(form.querySelectorAll('.settings-form__field')).pop();
        if (lastField) lastField.after(div);
        else form.prepend(div);

        div.querySelector('#flavortown-devlog-perf-toggle').addEventListener('change', (e) => {
            devlogPerfEnabled = e.target.checked;
            localStorage.setItem(STORAGE_KEY_DEVLOG_PERF, devlogPerfEnabled);
            optimizeDevlogs(devlogPerfEnabled);
        });
    }

    if (!document.getElementById('flavortown-extreme-perf-toggle')) {
        const div = document.createElement('div');
        div.className = 'settings-form__field';
        div.innerHTML = `
            <label class="settings-form__checkbox">
              <input type="checkbox" id="flavortown-extreme-perf-toggle" ${extremePerfEnabled ? 'checked' : ''}>
              <span>Extreme Performance Mode</span>
            </label>
            <small class="settings-form__hint">Blocks analytics and hides heavy assets.</small>
        `;
        const lastField = Array.from(form.querySelectorAll('.settings-form__field')).pop();
        if (lastField) lastField.after(div);
        else form.prepend(div);

        div.querySelector('#flavortown-extreme-perf-toggle').addEventListener('change', (e) => {
            extremePerfEnabled = e.target.checked;
            localStorage.setItem(STORAGE_KEY_EXTREME_PERF, extremePerfEnabled);
            applyExtremePerf(extremePerfEnabled);
        });
    }
}

function optimizeShop() {
    if (document.getElementById('flavortown-shop-optimization')) return;
    const styles = document.createElement('style');
    styles.id = 'flavortown-shop-optimization';
    styles.textContent = `
        .shop-item-card {
            content-visibility: auto;
            contain-intrinsic-size: 1px 400px;
            contain: layout paint style;
        }
    `;
    const target = document.head || document.documentElement;
    if (target) target.appendChild(styles);
}

function optimizeDevlogs(enable) {
    const styleId = 'flavortown-devlog-optimization';
    const existing = document.getElementById(styleId);
    if (enable) {
        if (existing) return;
        const styles = document.createElement('style');
        styles.id = styleId;
        styles.textContent = `
            .explore__list .post {
                content-visibility: auto;
                contain-intrinsic-size: 1px 600px;
                contain: layout paint style;
            }
        `;
        const target = document.head || document.documentElement;
        if (target) target.appendChild(styles);
    } else {
        if (existing) existing.remove();
    }
}

function modifyExploreNav() {
    if (!location.pathname.startsWith('/explore')) return;
    const nav = document.querySelector('.explore__nav');
    if (!nav) return;

    const projectsTab = nav.querySelector('a[href="/explore/gallery"]');
    if (projectsTab && !projectsTab.dataset.modified) {
        projectsTab.dataset.modified = 'true';
        const textNode = Array.from(projectsTab.childNodes).find(n => n.nodeType === 3 && n.textContent.trim().length > 0);
        if (textNode) textNode.textContent = ' Projects';
        const svg = projectsTab.querySelector('svg');
        if (svg) {
            svg.innerHTML = '<path fill-rule="evenodd" clip-rule="evenodd" d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5ZM10 12L7 9L8.4 7.6L12.8 12L8.4 16.4L7 15L10 12Z" fill="currentColor"></path><path d="M13 16H17V14H13V16Z" fill="currentColor"></path>';
        }
    }
}

function applyExtremePerf(enable) {
    const styleId = 'flavortown-extreme-perf';
    let existingStyle = document.getElementById(styleId);

    if (enable) {
        const scripts = document.querySelectorAll('script');
        scripts.forEach(s => {
            const src = s.src || '';
            const content = s.textContent || '';
            if (src.includes('plausible.io') || src.includes('zaraz') || src.includes('sentry') || content.includes('plausible') || content.includes('Sentry')) {
                s.remove();
            }
        });

        if (!existingStyle) {
            const styles = document.createElement('style');
            styles.id = styleId;
            styles.textContent = `
                .landing__hero, .hero, .sidebar__blob::before, img[src*="hero-bg"], img[src*="long-image"] {
                    background-image: none !important;
                    display: none !important;
                }
                iframe[src*="zaraz"], iframe[src*="plausible"] {
                    display: none !important;
                }
                .christmas-decoration {
                    display: none !important;
                }
            `;
            const target = document.head || document.documentElement;
            if (target) target.appendChild(styles);
        }
    } else {
        if (existingStyle) existingStyle.remove();
    }
}

init();


