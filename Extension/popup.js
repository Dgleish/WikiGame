document.addEventListener('DOMContentLoaded', loadPopup);
var backgroundPage = chrome.extension.getBackgroundPage();

function createGame() {
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        var sourcePage = document.getElementById('source').value;
        var activeTab = arrayOfTabs[0];
        backgroundPage.registerGame("https://en.wikipedia.org/w/index.php?search=" + sourcePage,
            activeTab.url, document.getElementById('nameTxt').value);
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
    var nick = document.getElementById('nameTxt').value;
    if (joinid != '') {
        if (nick != '') {
            backgroundPage.joinGame(joinid, document.getElementById('nameTxt').value);
        } else {
            alert("You need to provide a nickname");
        }
    }
}


function loadPopup() {
    var state = backgroundPage.getState();
    switch (state[0]) {
        case 0: // Pre-game state
            document.getElementById('name').style.display = 'inherit';
            document.getElementById('create').style.display = 'inherit';
            document.getElementById('join').style.display = 'inherit';
            break;
        case 1: // State when created a game, but waiting for other players
            addGameInfo();
            document.getElementById('go').style.display = 'inherit';
            document.getElementById('quit').style.display = 'inherit';
            break;
        default: // State when playing a game
            addGameInfo();
            document.getElementById('quit').style.display = 'inherit';
    }

    //add click listeners
    document.getElementById('createBtn').addEventListener('click', createGame);
    document.getElementById('goBtn').addEventListener('click', startGame);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('joinBtn').addEventListener('click', joinGame);
}

function addGameInfo() {
    var currState = backgroundPage.getState();
    if (currState[1] == -1) {
        setTimeout(addGameInfo, 200);
    } else {
        document.getElementById('playingID').innerText += currState[1];
        document.getElementById('playingName').innerText += currState[2];
        document.getElementById('playing').style.display = 'inherit';
    }
}