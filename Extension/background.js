// Initial setup
var pages = [];
var timer = 0;
var index = 0;
var badgeText = '';
var dest_page = '';
var gameID = -1;
var othersStats = [];
var source_url = '';
var dest_url = '';
chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});

// On each page load send position to server and get back position of everyone else playing same game
function update(tabId) {
    $.get("http://wiki-game-1109.appspot.com/update?gameID=" + gameID + "&index=" + (pages.length - 1), function (data) {
        console.log("Data Loaded: " + data);
        othersStats = [];
        var delimited = data.split(',');
        for (var i = 2; i < delimited.length; i++) {
            othersStats.push(delimited[i].split("'")[1] + ',' + delimited[i].split("'")[3] + "&");
        }
        console.log(othersStats);
        chrome.tabs.executeScript(tabId, {
            file: "jquery.tools.min.js"
        });
        chrome.tabs.insertCSS(tabId, {
            file: "Overlay/overlay.css"
        });
        chrome.tabs.executeScript(tabId, {
            file: "Overlay/overlay.js"
        }, function () {
            chrome.tabs.executeScript(tabId, {
                code: "createOverlay('" +
                delimited[0].split("'")[3].split('/wiki/')[1].replace(/_/g, ' ') +
                "','" + othersStats + "');"
            });
        });

    });
}

// Start a new game
function registerGame(source, dest) {
    $.get("http://wiki-game-1109.appspot.com/register?source=" + source + "&dest=" + dest, function (data) {
        gameID = data;
        console.log("gameID: " + data);
        source_url = source;
        dest_url = dest;
    });
}

// Leave a game
function unregisterGame() {
    $.get("http://wiki-game-1109.appspot.com/unregister?gameID=" + gameID, function (data) {
        console.log("Unregistered: " + data);
    });
}

// Join a game in progress
function joinGame(id) {
    gameID = id;
    $.get("http://wiki-game-1109.appspot.com/join?gameID=" + gameID, function (data) {
        console.log("result: " + data);
        if (data !== 'Failure') {
            source_url = data.split(',')[0];
            dest_url = data.split(',')[1];
            enterWaitingArea();
        }
    });

}
// Go into the waiting area before game starts
function enterWaitingArea() {
    var ready = false;
    var finishedRequest = false;
    while (!ready && finishedRequest) {
        finishedRequest = false;
        $.get("http://wiki-game-1109.appspot.com/check?gameID=" + gameID, function (data) {
            if (data == '1') {
                ready = true;
                finishedRequest = true;
            }
        });
    }
    console.log('Starting...');
    beginGame();
}

// Handle page changes
function urlChanged (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') { //once page fully loaded
        var urlArr = tab.url.split('/');
        console.log("tab url = " + tab.url);
        if (urlArr[2] === "en.wikipedia.org") { //if on wikipedia
            var currPage = urlArr[4].split("#")[0];
            if (currPage !== pages[index - 1]) { //check for navigation on same page

                //get rid of search bar
                chrome.tabs.executeScript(tabId, {
                    code: "document.getElementById('simpleSearch').remove()"
                });

                //check if just visited
                if (pages.length > 1 && pages[index - 2] === currPage) {
                    console.log("Went back");
                    decrementCounter();
                    index--;
                    pages.pop();
                } else {
                    console.log("Adding " + currPage + " at index " + index);
                    console.log("Pages so far: " + pages);
                    incrementCounter();
                    pages.push(currPage);
                    index++;
                }
                update(tabId);

                //check if reached destination
                if (currPage === dest_page) {
                    console.log("Finished");
                    timeTaken = (new Date()).getTime() - timer;
                    chrome.tabs.executeScript(tabId, {
                        code: "alert('Finished! Took you " + timeTaken + "ms and "
                        + (pages.length - 1) + " steps');"
                    });

                    endGame();
                }
            }
        } else { //navigated away, naughty
            chrome.tabs.executeScript(tabId, {
                code: "alert('You have to stay on Wikipedia! Game has finished');"
            });
            endGame();
        }
    }
};

// Start running the game session
function beginGame() {
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        var activeTab = arrayOfTabs[0];
        dest_page = dest_url.split('/')[4];
        alert("Destination is " + dest_page.replace("_", " "));
        console.info("Start");
        timer = (new Date()).getTime();
        chrome.tabs.onUpdated.addListener(urlChanged);
        chrome.tabs.update(activeTab.id, {
            url: source_url
        });
    });
}

function hostStart() {
    $.get("http://wiki-game-1109.appspot.com/go?gameID=" + gameID, function (data) {
        if (data != 'Success') {
            console.log("Failed to start game");
        } else {
            beginGame();
        }
    });
}

// Stop running the game session
function endGame() {
    unregisterGame();
    pages = [];
    index = 0;
    badgeText = '';
    dest_page = '';
    gameID = -1;
    console.info("Stop");
    chrome.tabs.onUpdated.removeListener(urlChanged);
    chrome.browserAction.setBadgeText({text: badgeText});
}

function incrementCounter() {
    if (badgeText.length == 0) {
        badgeText = '0';
    } else {
        badgeText = '' + (parseInt(badgeText, 10) + 1);
    }
    chrome.browserAction.setBadgeText({text: badgeText});
}

function decrementCounter() {
    badgeText = '' + (parseInt(badgeText, 10) - 1);
    chrome.browserAction.setBadgeText({text: badgeText});
}