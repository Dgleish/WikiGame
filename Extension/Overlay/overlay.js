function createOverlay(dest, stats) {
    var text = '<div id="wikigameInfoBox">' +
        '<div>Target: ' + dest + '</div>' + '<br>' +
        stats.replace(/&/g, "<br>").replace(/,/g, " | ") +
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




