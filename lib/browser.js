// Load in our dependencies
var ipcRenderer = require('electron').ipcRenderer;
var webContents = require('electron').remote.getCurrentWebContents();

// Overload `window.addEventListener` to prevent `unload` bindings
var _addEventListener = window.addEventListener;
window.addEventListener = function (eventName, fn, bubbles) {
  // If we received an unload binding, ignore it
  if (eventName === 'unload' || eventName === 'beforeunload') {
    return;
  }

  // Otherwise, run our normal addEventListener
  return _addEventListener.apply(window, arguments);
};

// When we finish loading
function handleLoad() {
  // update styles
  webContents.insertCSS("#nav-bar-background { -webkit-user-select: none;-webkit-app-region: drag; }");
  // Move topbar
  document.getElementsByTagName("ytmusic-nav-bar")[0].style.marginTop = "10px";

  // var events = ['change:song', 'change:playback', 'change:playback-time'];
  ipcRenderer.send("change:song", { title: "hello world" });
  var playpause = document.getElementsByClassName("play-pause-button")[0];
  ipcRenderer.send("change:playback", "stopped");

  new MutationObserver(function handleChange(data) {
    var state = data[0].target.attributes.getNamedItem("title").value;
    console.log(state);

    if (state == "Play") {
      ipcRenderer.send("change:playback", "paused");
    } else if (state == "Pause") {
      ipcRenderer.send("change:playback", "playing");
    } else {
      ipcRenderer.send("change:playback", "stopped");
    }
  }).observe(playpause, { attributes: true });

  var nowPlaying = document.getElementsByClassName("middle-controls")[0];
  new MutationObserver(function handleChange(data) {
    var title = nowPlaying.getElementsByClassName("title")[0].textContent;
    console.info(title);

    var text = nowPlaying.getElementsByClassName("byline")[0];
    console.debug(text); // parse both complex and other strings
    var artist = text.firstChild.firstChild.textContent;
    var album = text.lastChild.textContent;
    console.info(title, album);

    var img = nowPlaying.getElementsByTagName("img")[0];
    var art = img.attributes.getNamedItem("src").value;
    console.log(art);


    ipcRenderer.send("change:song", { title, artist, album, art });

  }).observe(playpause, { attributes: true, childList: true, subtree: true });




  // When we receive requests to control playback, run them
  ipcRenderer.on('control:play-pause', function handlePlayPause(evt) {
    console.log("playpause");
    playpause.click();
  });
  ipcRenderer.on('control:next', function handleNext(evt) {
    document.getElementsByClassName("next-button")[0].click();
  });
  ipcRenderer.on('control:previous', function handlePrevious(evt) {
    document.getElementsByClassName("previous-button")[0].click();
  });
  ipcRenderer.on('control:search', function handleSearch(evt) {
    document.getElementsByClassName("search-icon")[0].click();
  });
}
window.addEventListener('load', handleLoad);
