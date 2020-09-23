const electron = require("electron");
const store = require("electron-store");
const Express = require("express");
const request = require("request");

const app = electron.app;
const express = Express();
const server = express.listen(49698, "localhost");
const settings = new store({
  cwd: __dirname,
  name: "config"
});

var mainWindow = null, trayIcon = null;

app.on("window-all-closed", function() {
  app.quit();
  server.close();
  process.exit(1); 
});

app.on("ready", function() {
  mainWindow = new electron.BrowserWindow({
    width: 550,
    height: 300,
    title: "Spotify Overlay",
    icon: "./icon.png",
    
    webPreferences: {
      nodeIntegration: true
    },
    
    // frame: false,
    // transparent: true,
    
    // skipTaskbar: true,
    // autoHideMenuBar: true,
    
    // alwaysOnTop: true,
    // visibleOnAllWorkspaces: true,
    // hasShadow: false
  });

  mainWindow.loadURL("file://" + __dirname + "/index.html");

  // mainWindow.setAlwaysOnTop(true, "floating");
  // mainWindow.setVisibleOnAllWorkspaces(true);
  // mainWindow.setFullScreenable(false);
  // mainWindow.setIgnoreMouseEvents(true);

  mainWindow.on("minimize", function(event){
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on("close", function (event) {
    settings.set("window-position", mainWindow.getPosition());

    if (app.isQuiting) {
      return true;
    } else {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  if (settings.get("window-position")) {
    let pos = settings.get("window-position");
    mainWindow.setPosition(pos[0], pos[1]);
  }

  trayIcon = new electron.Tray(__dirname + "/icon.png");
  let contextMenu = electron.Menu.buildFromTemplate(
    [
      {
        label: "Hide/Show the window", 
        click: function () { toggleWindow(); }
      }, {
        label: "Exit", 
        click: function () { 
          app.isQuiting = true;
          app.quit();
          server.close();
          process.exit(1);
        } 
      }
    ]
  );

  trayIcon.setContextMenu(contextMenu);

  trayIcon.setToolTip(app.getName());

  trayIcon.on("click", function () {
    toggleWindow();
  });
});

function toggleWindow() {
  mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
}

express.get("/callback", function(req, res) {
  if (req.query.error) {
    res.send("Error!<br><br>" + req.query.error);
  } else {
    code = req.query.code;
  }
});

var code = null;