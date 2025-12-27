console.log('Flavortown extension Background Script loaded successfully!');

browser.runtime.onInstalled.addListener((details) => {
    console.log('Flavortown extension installed/updated:', details.reason);
});
