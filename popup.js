"use strict";

// list of urls to navigate
var statusDiv = document.querySelector(".status");

// start navigation when #startNavigation button is clicked
startNavigation.onclick = function(element) {
    chrome.tabs.query({
            active: true,
            currentWindow: true,
        },
        async function(tabs) {
            // navigate to next url

            await goToPage(tabs[0].id, tabs[0].url);

            // navigation of all pages is finished
        }
    );
};
//
async function goToPage(tab_id, url) {
    return new Promise(function(resolve, reject) {
        // update current tab with new url

        chrome.tabs.update({
            url: url,
        });
        // fired when tab is updated
        chrome.tabs.onUpdated.addListener(function openPage(tabID, changeInfo) {
            if (tab_id == tabID && changeInfo.status === "complete") {
                chrome.runtime.onConnect.addListener(function(port) {
                    if (port.name == "資料") {
                        port.onMessage.addListener(function(response) {
                            if (response.msg != null) {
                                let d = response.msg;
                                port.postMessage({ msg: d });
                                let blob = new Blob([JSON.stringify(d)], {
                                    type: "application/json;charset=utf-8",
                                });

                                let objectURL = URL.createObjectURL(blob);
                                let dateTime = Date.now();
                                let timestamp = Math.floor(dateTime / 1000);
                                chrome.downloads.download({
                                        url: objectURL,
                                        filename: `${timestamp}.txt`,
                                        conflictAction: "overwrite",
                                    },
                                    () => {
                                        resolve();
                                        port.disconnect();
                                        statusDiv.innerText = "抓完了";
                                        statusDiv.style.color = "rgb(0 255 8)";
                                        // alert("抓完了");
                                    }
                                );
                            } else {
                                // alert("開始抓取留言");
                                statusDiv.innerText = "抓取中...";
                            }
                        });
                    }
                });
                // remove tab onUpdate event as it may get duplicated
                chrome.tabs.onUpdated.removeListener(openPage);
                let type = "";
                if (url.includes("posts")) {
                    type = "article.js";
                } else if (url.includes("watch")) {
                    type = "video.js";
                } else {
                    type = "article.js";
                }
                // // execute content script
                chrome.tabs.executeScript({
                        file: type,
                    },
                    function() {
                        // resolve Promise after content script has executed
                        // resolve();
                    }
                );
            }
        });
    });
}

// async function to wait for x seconds
async function waitSeconds(seconds) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve();
        }, seconds * 1000);
    });
}

// function executeScript() {
//     console.log("run executeScript");
//     // return new Promise(function (resolve, reject) {
//     chrome.tabs.executeScript({
//             file: "script.js",
//         },
//         function() {
//             // resolve Promise after content script has executed
//             // resolve();
//         }
//     );
//     // })
// }