chrome.browserAction.setBadgeBackgroundColor({
    color: [190, 190, 190, 230]
});

// chrome.browserAction.setBadgeText({
//     text: "WOW"
// });

chrome.runtime.onInstalled.addListener(function () {
    console.log('oschina chrome extension installed.');
});

chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.create({
        url: "oschina.html"
    }, function (tab) {
        console.log('tab is:' + tab);
    });
});