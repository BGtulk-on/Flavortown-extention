try {
    let b = typeof browser !== 'undefined' ? browser : chrome
    b.runtime.onInstalled.addListener(() => { })
} catch (e) { }
