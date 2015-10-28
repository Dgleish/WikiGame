 function createOverlay(stats){

 var text = '<div id="wikigameInfoBox">' +
 '<div>Current counts:</div>' + '<br>'+
 stats.replace("&", "<br>").replace(",", " | ") +
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




