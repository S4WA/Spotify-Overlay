const electron = require("electron");
const Store = require("electron-store");

const app = electron.app;
const store = new Store({
  cwd: __dirname,
  name: "config"
});

var mainWindow = null, trayIcon = null;

app.on("window-all-closed", function() {
  app.quit();
});

app.on("ready", function() {
  mainWindow = new electron.BrowserWindow({
    width: 550,
    height: 300,
    title: "Spotify Overlay",
    icon: "./icon.png",
    
    frame: false,
    transparent: true,
    
    skipTaskbar: true,
    autoHideMenuBar: true,
    
    alwaysOnTop: true,
    visibleOnAllWorkspaces: true,
    hasShadow: false
  });

  mainWindow.loadURL("file://" + __dirname + "/index.html");

  mainWindow.setAlwaysOnTop(true, "floating");
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setFullScreenable(false);
  mainWindow.setIgnoreMouseEvents(true);

  mainWindow.on("minimize", function(event){
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on("close", function (event) {
    store.set("window-position", mainWindow.getPosition());

    if (app.isQuiting) {
      return true;
    } else {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  if (store.get("window-position")) {
    let pos = store.get("window-position");
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