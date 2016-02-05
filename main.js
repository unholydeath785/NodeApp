var app = require('app')
var BrowserWindow = require('browser-window')

app.on('ready',function () {
  var mainWindow = new BrowserWindow({
    height:800,
    width:1080
  })
  console.log("Loading");
  mainWindow.loadURL ('file://' + __dirname + '/index.html')
})
