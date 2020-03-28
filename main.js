const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;
// listen for app to be ready
app.on("ready", function() {
  //create new window
  mainWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true }
  });
  //load html file in window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "mainWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );

  //Quit app when closed
  mainWindow.on("close", function() {
    app.quit();
  });

  //build  menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

//handle create add window
function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add shopping list item",
    webPreferences: { nodeIntegration: true }
  });
  //load html file in window
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "addWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );
  //Garbage collection handle
  addWindow.on("close", function() {
    addWindow = null;
  });
}

// Catch item add
ipcMain.addListener("item:add", function(event, item) {
  mainWindow.webContents.send("item:add", item);
  addWindow.close();
});

//create menu template
const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        click() {
          createAddWindow();
        },
        accelerator: process.platform == "darwin" ? "Command+W" : "Ctrl+W"
      },
      {
        label: "Clear Items",
        click() {
          mainWindow.webContents.send("item:clear");
        }
      },
      {
        label: "Quit",
        click() {
          app.quit();
        },
        accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q"
      }
    ]
  }
];

//If mac, add empty object to menu as file is 2nd param
if (process.platform == "darwin") {
  mainMenuTemplate.unshift({});
}

//Add developer tools item if not in production
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Dev Tools",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
        accelerator: process.platform == "darwin" ? "F12" : "F12"
      },
      {
        role: "reload"
      }
    ]
  });
}
