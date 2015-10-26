function startGame(){
    chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
        var backgroundPage = chrome.extension.getBackgroundPage();
        var sourcePage = document.getElementById('source').value;
        var activeTab = arrayOfTabs[0]
        if(document.getElementById('gameid').value != ""){
            backgroundPage.joinGame(document.getElementById('gameid').value);
            console.log(document.getElementById('gameid').value);
        } else {
            backgroundPage.registerGame("https://en.wikipedia.org/w/index.php?search=" + sourcePage, activeTab.url);
        }
    });
}

function stopGame(){
    var backgroundPage = chrome.extension.getBackgroundPage();
    backgroundPage.stop();
}

document.addEventListener('DOMContentLoaded', function () {
      document.getElementById('goBtn').addEventListener('click', startGame);
      document.getElementById('stopBtn').addEventListener('click', stopGame);;
});