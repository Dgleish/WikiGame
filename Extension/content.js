window.onload = function(e) {
    document.getElementById('simpleSearch').remove();
    var url = window.location.href
    url = url.split("/");
    chrome.runtime.sendMessage({msg: "newPage", page: url[url.length-1]}, function(response){
        var time = response.time;
        var steps = response.steps;
        alert("Finished in " + time + "ms and " + steps + " steps!");
    });
}



