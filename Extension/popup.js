//TODO: Fix joining non-existent game
document.addEventListener('DOMContentLoaded', loadPopup);
var backgroundPage = chrome.extension.getBackgroundPage();
function createGame() {
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        var sourcePage = document.getElementById('source').value;
        var activeTab = arrayOfTabs[0];
        backgroundPage.registerGame("https://en.wikipedia.org/w/index.php?search=" + sourcePage, activeTab.url);
    });
}

function startGame() {
    backgroundPage.hostStart();
}
function stopGame() {
    backgroundPage.endGame();
}

function joinGame() {
    var joinid = document.getElementById('gameid').value;
    if (joinid != '') {
        backgroundPage.joinGame(joinid);
    }
}


function loadPopup() {
    var state = backgroundPage.getState();
    switch (state[0]) {
        case 0:
            document.getElementById('create').style.display = 'inherit';
            document.getElementById('join').style.display = 'inherit';
            break;
        case 1:
            setTimeout(addID, 200);
            document.getElementById('go').style.display = 'inherit';
            document.getElementById('quit').style.display = 'inherit';
            break;
        default:
            document.getElementById('playing').style.display = 'inherit';
            document.getElementById('quit').style.display = 'inherit';
            document.getElementById('playing').innerText += " " + state[1];
    }

    //add click listeners
    document.getElementById('createBtn').addEventListener('click', createGame);
    document.getElementById('goBtn').addEventListener('click', startGame);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('joinBtn').addEventListener('click', joinGame);
}

function addID() {
    if (backgroundPage.getState()[1] == -1) {
        setTimeout(addID, 200);
    } else {
        document.getElementById('playing').innerText += backgroundPage.getState()[1];
        document.getElementById('playing').style.display = 'inherit';
    }
}