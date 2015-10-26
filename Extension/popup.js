function startGame(){
    chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
        var backgroundPage = chrome.extension.getBackgroundPage();
        var sourcePage = document.getElementById('source').value;
        var activeTab = arrayOfTabs[0]
        chrome.tabs.update(activeTab.id, {url: "https://en.wikipedia.org/w/index.php?search=" + sourcePage});
        console.log(backgroundPage);

        backgroundPage.registerGame(activeTab.url);
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