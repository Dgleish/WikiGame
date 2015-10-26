//initial setup
var pages = [];
var timer = 0;
var index = 0;
var badgeText = '';
var destination = '';
var gameID = 0;
chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });

function update(){
$.get("http://wiki-game-1109.appspot.com/update?gameID="+gameID+"&index=" + index, function(data){
        alert("Data Loaded: " + data);
    });
}
function registerGame(dest){
    $.get("http://wiki-game-1109.appspot.com/register", function(data){
            gameID = data;
            console.log("gameID: " + data);
            start(dest);
        });
}
function unregisterGame(){
    $.get("http://wiki-game-1109.appspot.com/unregister?gameID="+gameID, function(data){
                alert("success: " + data);
            });
}

function joinGame(id){
    $.get("http://wiki-game-1109.appspot.com/join?gameID="+gameID, function(data){
                    alert("success: " + data);
                });
}
var urlChanged = function(tabId, changeInfo, tab){
    if(changeInfo.status == 'complete'){
        update();
        var urlArr = tab.url.split('/');
        console.log("tab url = " + tab.url);
    if(urlArr[2] === "en.wikipedia.org"){ //if on wikipedia
        var currPage = urlArr[4];
        //get rid of search bar
        chrome.tabs.executeScript(tabId, {
           code: "document.getElementById('simpleSearch').remove()"
        });

        //check if just visited
        if(pages.length > 1 && pages[index-2] === currPage){
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
        if(index != (pages.length)){
            console.log("Index is " + index + ", array length is " + pages.length);
        }
        //check if reached destination
        if(currPage === destination){
            console.log("Finished");
            timeTaken = (new Date()).getTime() - timer;
            chrome.tabs.executeScript(tabId, {
                code: "alert('Finished! Took you " + timeTaken +"ms and "
                            + (pages.length-1) + " steps');"
            });

            stop();
        }
    } else { //navigated away, naughty
        chrome.tabs.executeScript(tabId, {
            code: "alert('You have to stay on Wikipedia! Game has finished');"
        });
        stop();
    }
    }
}

function start(dest){
    destination = dest.split('/')[4];
    console.info("Start");
    timer = (new Date()).getTime();
    chrome.tabs.onUpdated.addListener(urlChanged);
}

function stop(){
    unregisterGame();
    pages = [];
    index = 0;
    badgeText = '';
    destination = '';
    console.info("Stop");
    chrome.tabs.onUpdated.removeListener(urlChanged);
    chrome.browserAction.setBadgeText({text: badgeText});
}

function incrementCounter(){
     if(badgeText.length == 0){
            badgeText = '0';
        } else {
            badgeText = '' + (parseInt(badgeText, 10)+1);
        }
    chrome.browserAction.setBadgeText({text: badgeText});
}

function decrementCounter(){
     badgeText = '' + (parseInt(badgeText, 10)-1);
     chrome.browserAction.setBadgeText({text: badgeText});
}