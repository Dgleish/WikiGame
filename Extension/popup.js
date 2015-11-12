//TODO: Decide how to handle initial player starting game from waiting area - different semantics?
var backgroundPage = chrome.extension.getBackgroundPage();

function createGame() {
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        var sourcePage = document.getElementById('source').value;
        var activeTab = arrayOfTabs[0];
        backgroundPage.registerGame("https://en.wikipedia.org/w/index.php?search=" + sourcePage, activeTab.url);
    });
}

function startGame(){
    backgroundPage.hostStart();
}
function stopGame() {
    backgroundPage.endGame();
}

function joinGame() {
    backgroundPage.joinGame(document.getElementById('gameid').value);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('createBtn').addEventListener('click', createGame);
    document.getElementById('goBtn').addEventListener('click', startGame);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('joinBtn').addEventListener('click', joinGame);
});