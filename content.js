let noSnow = localStorage.getItem('flavortown_snow_disabled') === 'true'
let dedup = localStorage.getItem('flavortown_dedup_attachments') === 'true'

let devPerf = localStorage.getItem('flavortown_optimize_devlogs') === 'true'
let maxPerf = localStorage.getItem('flavortown_extreme_perf') === 'true'


function main() {
    updateSnow(noSnow)
    shopFix()

    devlogFix(devPerf)
    extremeFix(maxPerf)
    navMod()

    let cb = () => {
        obs()
        ui()
        dedup && doDedup()

        navMod()
    }

    if (document.body) cb()
    else document.addEventListener('DOMContentLoaded', cb)
}

function obs() {
    new MutationObserver(() => {
        ui()

        shopFix()
        devlogFix(devPerf)
        extremeFix(maxPerf)

        if (dedup) doDedup()

        if (noSnow && document.body?.getAttribute('data-controller') === 'snow') {
            document.body.removeAttribute('data-controller')
        }

    }).observe(document.body, { childList: true, subtree: true, attributes: true })
}

function updateSnow(val) {
    noSnow = val
    localStorage.setItem('flavortown_snow_disabled', val)

    if (val) {
        if (document.body?.getAttribute('data-controller') === 'snow') {
            document.body.removeAttribute('data-controller')
        }

        if (!document.getElementById('no-snow-css')) {
            let s = document.createElement('style')
            s.id = 'no-snow-css'

            s.textContent = `.snow-layer,.falling-snow-container,.sidebar__user-avatar-santa-hat{display:none!important}`
                ; (document.head || document.documentElement).appendChild(s)
        }

    } else {
        document.body?.setAttribute('data-controller', 'snow')
        document.getElementById('no-snow-css')?.remove()
    }
}


function doDedup() {
    document.querySelectorAll('.post__attachments .post__track').forEach(t => {
        let seen = new Set()
        let slides = Array.from(t.querySelectorAll('.post__slide'))
        let indParams = t.parentElement.querySelector('.post__indicators')

        let dots = indParams ? Array.from(indParams.querySelectorAll('.post__dot')) : []
        let bad = []

        slides.forEach((slide, i) => {
            let m = slide.querySelector('img, video')

            if (m?.src) {
                let name = m.src.split('/').pop().split('?')[0]
                if (seen.has(name)) {
                    slide.remove()
                    bad.push(i)
                } else seen.add(name)
            }
        })


        if (bad.length && dots.length) {
            bad.reverse().forEach(i => dots[i]?.remove())
            let left = indParams.querySelectorAll('.post__dot')

            left.forEach((d, i) => d.setAttribute('data-index', i))
            if (!t.parentElement.querySelector('.post__dot.is-active') && left.length) {
                left[0].classList.add('is-active')
            }
        }

        if (t.querySelectorAll('.post__slide').length <= 1) {
            let vp = t.closest('.post__viewport')
            if (vp) {
                vp.querySelectorAll('.post__chevron--prev, .post__chevron--next').forEach(b => b.style.display = 'none')
            }
        }
    })
}

function ui() {
    let f = document.querySelector('#settings-form')
    if (!f) return

    let add = (id, txt, hint, state, fn) => {
        if (document.getElementById(id)) return

        let d = document.createElement('div')
        d.className = 'settings-form__field'
        d.innerHTML = `<label class="settings-form__checkbox"><input type="checkbox" id="${id}" ${state ? 'checked' : ''}><span>${txt}</span></label><small class="settings-form__hint">${hint}</small>`

        let last = Array.from(f.querySelectorAll('.settings-form__field')).pop()
        last ? last.after(d) : f.prepend(d)
        d.querySelector(`input`).onchange = fn
    }

    add('ft-snow', 'Disable Snow Effects', 'Reduces lag by finding the off switch for the snow machine.', noSnow, e => updateSnow(e.target.checked))

    add('ft-dedup', 'Hide Duplicate Attachments', 'Fixes the bug where images and videos appear twice.', dedup, e => {
        dedup = e.target.checked
        localStorage.setItem('flavortown_dedup_attachments', dedup)
        if (dedup) doDedup()
    })

    add('ft-devlog', 'Optimize Devlog Feed', 'Improves scrolling by lazy-rendering posts.', devPerf, e => {
        devPerf = e.target.checked
        localStorage.setItem('flavortown_optimize_devlogs', devPerf)
        devlogFix(devPerf)
    })
    add('ft-extreme', 'Extreme Performance Mode', 'Blocks analytics and hides heavy assets.', maxPerf, e => {
        maxPerf = e.target.checked
        localStorage.setItem('flavortown_extreme_perf', maxPerf)
        extremeFix(maxPerf)
    })
}

function shopFix() {
    if (document.getElementById('ft-shop')) return

    let s = document.createElement('style')
    s.id = 'ft-shop'
    s.textContent = `.shop-item-card{content-visibility:auto;contain-intrinsic-size:1px 400px;contain:layout paint style}`
        ; (document.head || document.documentElement).appendChild(s)
}

function devlogFix(on) {
    let id = 'ft-devlog-css'
    let ex = document.getElementById(id)


    if (on) {
        if (ex) return
        let s = document.createElement('style')
        s.id = id
        s.textContent = `.explore__list .post{content-visibility:auto;contain-intrinsic-size:1px 600px;contain:layout paint style}`
            ; (document.head || document.documentElement).appendChild(s)
    } else ex?.remove()
}

function navMod() {
    if (!location.pathname.startsWith('/explore')) return
    let nav = document.querySelector('.explore__nav')
    if (!nav) return

    let tab = nav.querySelector('a[href="/explore/gallery"]')
    if (tab && !tab.dataset.mod) {
        tab.dataset.mod = 'true'

        let txt = Array.from(tab.childNodes).find(n => n.nodeType === 3 && n.textContent.trim().length)
        if (txt) txt.textContent = ' Projects'
        let svg = tab.querySelector('svg')
        if (svg) svg.innerHTML = '<path fill-rule="evenodd" clip-rule="evenodd" d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5ZM10 12L7 9L8.4 7.6L12.8 12L8.4 16.4L7 15L10 12Z" fill="currentColor"></path><path d="M13 16H17V14H13V16Z" fill="currentColor"></path>'
    }
}

function extremeFix(on) {
    let id = 'ft-extreme-css'
    let ex = document.getElementById(id)

    if (on) {
        document.querySelectorAll('script').forEach(s => {
            if ((s.src && (s.src.includes('plausible') || s.src.includes('zaraz') || s.src.includes('sentry'))) ||
                (s.textContent && (s.textContent.includes('plausible') || s.textContent.includes('Sentry')))) {
                s.remove()
            }
        })

        if (!ex) {
            let s = document.createElement('style')
            s.id = id
            s.textContent = `.landing__hero,.hero,.sidebar__blob::before,img[src*="hero-bg"],img[src*="long-image"],iframe[src*="zaraz"],iframe[src*="plausible"],.christmas-decoration{display:none!important;background-image:none!important}`
                ; (document.head || document.documentElement).appendChild(s)
        }
    } else ex?.remove()
}

main()
