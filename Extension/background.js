//initial setup
var pages = [];
var timer = 0;
var index = 0;
var badgeText = '';
var destination = '';
var gameID = -1;
var othersStats = [];
chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });

function update(tabId){
$.get("http://wiki-game-1109.appspot.com/update?gameID="+gameID+"&index=" + (pages.length-1), function(data){
        console.log("Data Loaded: " + data);
        othersStats = [];
        var delimited = data.split(',');
        for(var i=2;i<delimited.length;i++){
            othersStats.push(delimited[i].split("'")[1]+','+delimited[i].split("'")[3]+"&");
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
        }, function() {
        chrome.tabs.executeScript(tabId, {
                                   code: "createOverlay('" + othersStats + "');"
                               });});

    });
}
function registerGame(source, dest){
    $.get("http://wiki-game-1109.appspot.com/register?source=" + source + "&dest=" + dest, function(data){
            gameID = data;
            console.log("gameID: " + data);
            start(source, dest);
        });
}
function unregisterGame(){
    $.get("http://wiki-game-1109.appspot.com/unregister?gameID="+gameID, function(data){
                console.log("Unregistered: " + data);
            });
}

function joinGame(id){
    $.get("http://wiki-game-1109.appspot.com/join?gameID="+gameID, function(data){
                    console.log("result: " + data);
                    if(data !== 'Failure'){
                        var sourceURL = data.split(',')[0];
                        var destURL = data.split(',')[1];
                        start(sourceURL, destURL);
                     }
                });

}
var urlChanged = function(tabId, changeInfo, tab){
    if(changeInfo.status == 'complete'){
        var urlArr = tab.url.split('/');
        console.log("tab url = " + tab.url);
    if(urlArr[2] === "en.wikipedia.org"){ //if on wikipedia
        var currPage = urlArr[4];
        if(currPage.search("#") == -1){ //check for navigation on same page
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
            }else {
                console.log("Adding " + currPage + " at index " + index);
                console.log("Pages so far: " + pages);
                incrementCounter();
                pages.push(currPage);
                index++;
            }
            if(index != (pages.length)){
                console.log("Index is " + index + ", array length is " + pages.length);
            }
            update(tabId);
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
        }
    } else { //navigated away, naughty
        chrome.tabs.executeScript(tabId, {
            code: "alert('You have to stay on Wikipedia! Game has finished');"
        });
        stop();
    }
    }
}

function start(source, dest){

 chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
    var activeTab = arrayOfTabs[0]

    destination = dest.split('/')[4];
    alert("Destination is " + destination.replace("_"," "));
    console.info("Start");
    timer = (new Date()).getTime();
    chrome.tabs.onUpdated.addListener(urlChanged);
    chrome.tabs.update(activeTab.id, {
            url: source});
    });

}

function stop(){
    unregisterGame();
    pages = [];
    index = 0;
    badgeText = '';
    destination = '';
    gameID = -1;
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