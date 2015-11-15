// Initial setup
var pages = [];
var timer = 0;
var index = 0;
var badgeText = '';
var dest_page = '';
var gameID = -1;
var source_url = '';
var dest_url = '';
var playerid = 0;
var checkTimer;
chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});

//Popup state
var state = 0;

// On each page load send position to server and get back position of everyone else playing same game
function update(tabId) {
    $.get("http://wiki-game-1109.appspot.com/update?gameID=" + gameID + "&index=" +
        (pages.length - 1) + "&pid=" + playerid, function (data) {
        others = [];
        othersPages = [];
        var delimited = data.split(',');
        for (var i = 0; i < delimited.length; i++) {
            others.push(delimited[i].split("'")[1] + "&");
            othersPages.push(delimited[i].split("'")[3] + "&");
        }
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
                dest_page + "','" + others + "','" + othersPages + "');"
            });
        });

    });
}

// Start a new game
function registerGame(source, dest) {
    state = 1;
    creator = true;
    playerid = getRandomInt();
    $.get("http://wiki-game-1109.appspot.com/register?source=" + source
        + "&dest=" + dest + "&pid=" + playerid, function (data) {
        gameID = data;
        console.log("gameID: " + data);
        source_url = source;
        dest_url = dest;
    });
}

// Leave a game
function unregisterGame() {
    $.get("http://wiki-game-1109.appspot.com/unregister?gameID=" + gameID + "&pid=" + playerid, function (data) {
        console.log("Unregistered: " + data);
    });
}

// Join a game in progress
function joinGame(id) {
    state = 2;
    playerid = getRandomInt();
    gameID = id;
    $.get("http://wiki-game-1109.appspot.com/join?gameID=" + gameID + "&pid=" + playerid, function (data) {
        console.log("joingame: " + data);
        if (data !== 'Failure') {
            source_url = data.split(',')[0];
            dest_url = data.split(',')[1];
            // Go into the waiting area before game starts
            checkTimer = setInterval(checkForGameStart, 500);
        }
    });

}

// Handle page changes
function urlChanged(tabId, changeInfo, tab) {
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


                //check if reached destination
                if (currPage === dest_page) {
                    console.log("Finished");
                    timeTaken = (new Date()).getTime() - timer;
                    chrome.tabs.executeScript(tabId, {
                        code: "alert('Finished! Took you " + timeTaken + "ms and "
                        + (pages.length - 1) + " steps');"
                    });

                    endGame();
                } else {
                    update(tabId);
                }
            }
        } else { //navigated away, naughty
            chrome.tabs.executeScript(tabId, {
                code: "alert('You have to stay on Wikipedia! Game has finished');"
            });
            endGame();
        }
    }
}

// Start running the game session
function beginGame() {
    clearInterval(checkTimer);
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        var activeTab = arrayOfTabs[0];
        dest_page = dest_url.split('/')[4];
        console.info("Start");
        timer = (new Date()).getTime();
        chrome.tabs.onUpdated.addListener(urlChanged);
        chrome.tabs.update(activeTab.id, {
            url: source_url
        });
    });
}

function hostStart() {
    state = 2;
    $.get("http://wiki-game-1109.appspot.com/go?gameID=" + gameID + "&pid=" + playerid, function (data) {
        if (data != 'Success') {
            console.log("Failed to start game");
        } else {
            beginGame();
        }
    });
}

function checkForGameStart() {
    $.get("http://wiki-game-1109.appspot.com/check?gameID=" + gameID + "&pid=" + playerid, function (data) {
        if (data == '1') {
            console.log('Starting...');
            beginGame();
        }
    });
}

// Stop running the game session
function endGame() {
    state = 0;
    unregisterGame();
    creator = false;
    pages = [];
    index = 0;
    badgeText = '';
    dest_page = '';
    gameID = -1;
    chrome.tabs.onUpdated.removeListener(urlChanged);
    chrome.browserAction.setBadgeText({text: badgeText});
    console.info("Stop");
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

function getRandomInt() {
    var min = 10;
    var max = 1000000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getState() {
    return [state, gameID];
}
function setState(x) {
    state = x;
}