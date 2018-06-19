// Load in our dependencies
var ipcMain = require('electron').ipcMain;
var _ = require('underscore');
var MediaService = require('./darwin/index');

exports.init = function (gme) {
  var mediaService = new MediaService();

  mediaService.on('next', gme.controlNext);
  mediaService.on('playpause', gme.controlPlayPause);
  mediaService.on('previous', gme.controlPrevious);

  var songInfo = {};
  ipcMain.on('change:song', function handleSongChange (evt, _songInfo) {
    var songInfo = {
      albumArt: _songInfo.art,
      // Convert milliseconds to microseconds (1s = 1e3ms = 1e6µs)
      duration: _songInfo.duration * 1e3,
      album: _songInfo.album,
      artist: _songInfo.artist,
      title: _songInfo.title
    };
    mediaService.setMetaData(songInfo);
  });

  ipcMain.on('change:playback-time', function handlePlaybackUpdate (evt, playbackInfo) {
    var newPosition = playbackInfo.current * 1e3;
    mediaService.setMetaData({ currentTime: newPosition });
  });

  var playbackStrings = {};
  ipcMain.on('change:playback', function handlePlaybackChange (evt, playbackState) {
    mediaService.setMetaData({ state: playbackState })
  });

  mediaService.startService();
};
