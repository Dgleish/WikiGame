function createOverlay(dest, players, stats) {
    var text = '<div id="wikigameInfoBox">' +
        '<div id="target">Target: ' + dest + '</div>' + '<br>' +
        '<table><tr><th>Player</th><th>Clicks</th></tr><tr><td align="center">' +
        players.replace(/&/g, "<br>").replace(/,/g, "") + '</td><td align="center">' + stats.replace(/&/g, "<br>") +
        '</td></tr></table>' +
        '</div>';
    $('body').append($(text));
    $('#wikigameInfoBox').overlay({

        // custom top position
        top: 15,
        left: 0,
        speed: 'slow',
        // disable this for modal dialog-type of overlays
        closeOnClick: false,

        // load it immediately after the construction
        load: true

    });
}




