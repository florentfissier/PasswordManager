const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
const crypto = require('crypto');
const { spawn } = require('child_process');

let isWin = process.platform === 'win32';

const algorithm = "aes-256-cbc";
let key = undefined;
let user = undefined;
let homeDir = undefined;
let pwmanDir = undefined;
let pwmanfile = undefined;
let keyForAES = undefined;
let first_time = true;

let win;

function createWindow () {
  win = new BrowserWindow({
    width: 816,
    height: 659,
    minWidth: 816,
    minHeight: 659,
    icon: path.join(__dirname, 'assets/icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js')
    }
  });

  win.loadFile('src/index.html');

  win.setMenu(null);
  // on les enlevera pour packager
  // win.webContents.openDevTools({mode:'undocked'});
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if(isWin) {
      fs.readdirSync(pwmanDir).forEach(file => {
        if ((file !== "master.pw") && (file !== "infos.json")) {
          let currFile = pwmanDir + "\\" + file;
          fs.readdirSync(currFile).forEach(subfile => {
            if (subfile.includes("cle") && !(subfile.includes(".pw"))) {
              let toDel = currFile + "\\" + subfile;
              fs.rmSync(toDel, {force: true});
            }
          });
        }
      });
    }
    app.quit()
  }
});

function encrypt(message) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, keyForAES, iv);
  let encrypted = iv.toString("hex") + cipher.update(message, "utf-8", "hex") + cipher.final("hex");
  return encrypted;
}

function decrypt (encrypted) {
  const iv = Buffer.from(encrypted.slice(0, 32), 'hex');
  encrypted = Buffer.from(encrypted.slice(32), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, keyForAES, iv);
  let decrypted = decipher.update(encrypted) + decipher.final("utf-8");
  return decrypted;
}

function executeSync(command) {
  return execSync(command).toString();
}

function get_user_name_linux() {
  user = executeSync("whoami").replace(/\n/g, "");
  return user;
}

function get_user_name_windows() {
  user = executeSync("echo %username%").replace(/\r\n/g, "");
  return user;
}

function get_home_path_linux() {
  homeDir = executeSync("getent passwd " + user + " | cut -d: -f6").replace(/\n/g, "");
  return homeDir;
}

function get_home_path_windows() {
  homeDir = executeSync("echo %userprofile%").replace(/\r\n/g, "");
  return homeDir;
}

function check_pwman_dir_linux() {
  let path = homeDir + "/.SimpleManager";
  let masterpw = path + "/master.pw";
  let returnValue = "";

  if (fs.existsSync(path)) {
    if (fs.existsSync(masterpw)) {
      returnValue = "bothExist";
    }
    else {
      returnValue = "pathExists";
    }
  }
  else {
    fs.mkdirSync(path);
    returnValue = "noneExist";
  }
  pwmanDir = path;
  pwmanfile = masterpw;
  return returnValue;
}

function check_pwman_dir_windows() {
  let path = homeDir + "\\AppData\\Local\\SimpleManager";
  let masterpw = path + "\\master.pw";
  let returnValue = "";

  if (fs.existsSync(path)) {
    if (fs.existsSync(masterpw)) {
      returnValue = "bothExist";
    }
    else {
      returnValue = "pathExists";
    }
  }

  else {
    fs.mkdirSync(path);
    returnValue = "noneExist";
  }
  pwmanDir = path;
  pwmanfile = masterpw;
  return returnValue;
}

function create_master_password_file_linux(passwd) {
  let hash = crypto.createHash('sha512').update(passwd).digest('hex');
  fs.writeFileSync(pwmanfile, hash, {
    encoding: "utf-8",
    flag: "w",
    mode: 0o400
  });
}

function create_master_password_file_windows(passwd) {
  let hash = crypto.createHash('sha512').update(passwd).digest('hex');
  fs.writeFileSync(pwmanfile, hash, {
    encoding: "utf-8",
    flag: "w",
    mode: 0o400
  });
}

function check_master_password_linux(passwd) {
  let returnValue = [];
  let hash = crypto.createHash('sha512').update(passwd).digest('hex');
  let data = fs.readFileSync(pwmanfile, {
    encoding: "utf-8",
    flag: "r"
  });
  if (hash === data) {
    key = passwd;
    keyForAES = crypto.createHash('sha256').update(key).digest('hex').substr(0, 32);
    returnValue[0] = true;
    let i = 1;
    fs.readdirSync(pwmanDir).forEach(file => {
    if (file !== "master.pw") {
      let imageExists = undefined;
      let currFile = pwmanDir + "/" + file;
      fs.readdirSync(currFile).forEach(subfile => {
        if (subfile === "image.png") {
          imageExists = true;
        }
      })
      returnValue[i] = [];
      returnValue[i][0] = file;
      if (imageExists) {
        returnValue[i][1] = pwmanDir + "/" + file + "/image.png";
      }
      else {
        returnValue[i][1] = false;
      }
      i += 1;
    }
  });
  }
  else {
    returnValue[0] = false;
  }
  return returnValue;
}

function check_master_password_windows(passwd) {
  let returnValue = [];
  let hash = crypto.createHash('sha512').update(passwd).digest('hex');
  let data = fs.readFileSync(pwmanfile, {
    encoding: "utf-8",
    flag: "r"
  });
  if (hash === data) {
    key = passwd;
    keyForAES = crypto.createHash('sha256').update(key).digest('hex').substr(0, 32);
    returnValue[0] = true;
    let i = 1;
    fs.readdirSync(pwmanDir).forEach(file => {
    if ((file !== "master.pw") && (file !== "infos.json")) {
      let imageExists = undefined;
      let currFile = pwmanDir + "\\" + file;
      fs.readdirSync(currFile).forEach(subfile => {
        if (subfile === "image.png") {
          imageExists = true;
        }
      })
      returnValue[i] = [];
      returnValue[i][0] = file;
      if (imageExists) {
        returnValue[i][1] = pwmanDir + "\\" + file + "\\image.png";
      }
      else {
        returnValue[i][1] = false;
      }
      i += 1;
    }
  });
  }
  else {
    returnValue[0] = false;
  }
  return returnValue;
}

function directory_listing_linux() {
  let returnValue = [];
  returnValue[0] = true;
  let i = 1;
  fs.readdirSync(pwmanDir).forEach(file => {
    if ((file !== "master.pw") && (file !== "infos.json")) {
      let imageExists = undefined;
      let currFile = pwmanDir + "/" + file;
      fs.readdirSync(currFile).forEach(subfile => {
        if (subfile === "image.png") {
          imageExists = true;
        }
      })
      returnValue[i] = [];
      returnValue[i][0] = file;
      if (imageExists) {
        returnValue[i][1] = pwmanDir + "/" + file + "/image.png";
      }
      else {
        returnValue[i][1] = false;
      }
      i += 1;
    }
  })
  return returnValue;
}

function directory_listing_windows() {
  let returnValue = [];
  returnValue[0] = true;
  let i = 1;
  fs.readdirSync(pwmanDir).forEach(file => {
    if ((file !== "master.pw") && (file !== "infos.json")) {
      let imageExists = undefined;
      let currFile = pwmanDir + "\\" + file;
      fs.readdirSync(currFile).forEach(subfile => {
        if (subfile === "image.png") {
          imageExists = true;
        }
      })
      returnValue[i] = [];
      returnValue[i][0] = file;
      if (imageExists) {
        returnValue[i][1] = pwmanDir + "\\" + file + "\\image.png";
      }
      else {
        returnValue[i][1] = false;
      }
      i += 1;
    }
  })
  return returnValue;
}

function allow_write_permission(filename) {
  if (fs.existsSync(filename)) {
    fs.chmodSync(filename, 0o600);
  }
}

ipcMain.on("toMain", (event, args) => {
  if (!isWin) {
    get_user_name_linux();
    get_home_path_linux();
    win.webContents.send("fromMain", check_pwman_dir_linux());
  }
  else {
    get_user_name_windows();
    get_home_path_windows();
    win.webContents.send("fromMain", check_pwman_dir_windows());
  }
});

ipcMain.on("createPasswd", (event, args) => {
  if(!isWin) {
    key = args;
    keyForAES = crypto.createHash('sha256').update(key).digest('hex').substr(0, 32);
    create_master_password_file_linux(key);
    win.webContents.send("createdPasswd", "");
  }
  else {
    key = args;
    keyForAES = crypto.createHash('sha256').update(key).digest('hex').substr(0, 32);
    create_master_password_file_windows(key);
    win.webContents.send("createdPasswd", "");
  }
});


ipcMain.on("checkPasswd", (event, args) => {
  if(!isWin) {
    win.webContents.send("checkedPasswd", check_master_password_linux(args));
  }
  else {
    win.webContents.send("checkedPasswd", check_master_password_windows(args));
  }
});

ipcMain.on("firstTime", (event, args) => {
  let path_info_json = pwmanDir;
  if (!isWin) {
    path_info_json += "/infos.json";
  }
  else {
    path_info_json += "\\infos.json";
  }
  if (fs.existsSync(path_info_json)) {
    win.webContents.send("firstTime", false);
  }
  else {
    fs.writeFileSync(path_info_json, "", {
      encoding: "utf-8",
      flag: "w",
      mode: 0o400
    });
    win.webContents.send("firstTime", true);
  }
})

ipcMain.on("addElement", (event, args) => {
  if (!isWin) {
    let path = pwmanDir + "/" + args[0];
    if (fs.existsSync(path)) {
      win.webContents.send("addedElement", directory_listing_linux());
    // console.log("ce dossier existe deja");
    }
    else {
      fs.mkdirSync(path);
      let urlfile = path + "/url.txt";
      let loginfile = path + "/login.txt"
      if (args[1] !== "") {
        fs.writeFileSync(urlfile, args[1], {
          encoding: "utf-8",
          flag: "w",
          mode: 0o400
        });
      }
      if (args[2] !== "") {
        fs.writeFileSync(loginfile, args[2], {
          encoding: "utf-8",
          flag: "w",
          mode: 0o400
        });
      }
      let passwdfile = path + "/passwd.pw"
      fs.writeFileSync(passwdfile, encrypt(args[3]), {
        encoding: "utf-8",
        flag: "w",
        mode: 0o400
      });
      let imagefile = path + "/image.png";
      if (args[4] !== "") {
        fs.copyFileSync(args[4], imagefile);
      }
      win.webContents.send("addedElement", directory_listing_linux())
    }
  }
  else {
    let path = pwmanDir + "\\" + args[0];
    if (fs.existsSync(path)) {
      win.webContents.send("addedElement", directory_listing_windows());
    // console.log("ce dossier existe deja");
    }
    else {
      fs.mkdirSync(path);
      let urlfile = path + "\\url.txt";
      let loginfile = path + "\\login.txt"
      if (args[1] !== "") {
        if (args[1].includes("\\")) {
          let urlcontent = args[1].replace(/\\/g, "\\\\");
          fs.writeFileSync(urlfile, urlcontent, {
            encoding: "utf-8",
            flag: "w",
            mode: 0o400
          });
        }
        else {
          fs.writeFileSync(urlfile, args[1], {
            encoding: "utf-8",
            flag: "w",
            mode: 0o400
          });
        }
      }
      if (args[2] !== "") {
        fs.writeFileSync(loginfile, args[2], {
          encoding: "utf-8",
          flag: "w",
          mode: 0o400
        });
      }
      let passwdfile = path + "\\passwd.pw"
      fs.writeFileSync(passwdfile, encrypt(args[3]), {
        encoding: "utf-8",
        flag: "w",
        mode: 0o400
      });
      let imagefile = path + "\\image.png";
      if (args[4] !== "") {
        fs.copyFileSync(args[4], imagefile);
      }
      let keyfile = path + "\\cle";
      if (args[5] !== "") {
        let dataKey = fs.readFileSync(args[5], {
          encoding: "utf-8",
          flag: "r"
        });
        let indexForName = 0;
        let indexForExt = 0;
        let revIndexForExt;
        let argsToString = args[5].toString();
        for (let i= argsToString.length - 1; i>=0; i--) {
          if (argsToString[i] === "\\" && indexForName === 0) {
            indexForName = i;
          }
          if (argsToString[i] === "." && indexForExt === 0 && indexForName === 0) {
            indexForExt = i;
          }
        }
        if (indexForExt !== 0) {
          revIndexForExt = (argsToString.length) - (argsToString.length - indexForExt - 1);
          keyfile +=  "." + argsToString.substring(revIndexForExt);
        }
        keyfile += ".pw";
        fs.writeFileSync(keyfile, encrypt(dataKey), {
          encoding: "utf-8",
          flag: "w",
          mode: 0o400
        });
      }
      win.webContents.send("addedElement", directory_listing_windows())
    }
  }
});

ipcMain.on("showElement", (event, args) => {
  if(!isWin) {
    let data = [];
    data[0] = args;
    let path = pwmanDir + "/" + args;
    let urlfile = path + "/url.txt";
    let loginfile = path + "/login.txt";
    let imagefile = path + "/image.png";
    let passwdfile = path + "/passwd.pw";
    if (fs.existsSync(urlfile)) {
      data[1] = fs.readFileSync(urlfile, {
        encoding: "utf-8",
        flag: "r"
      });
    }
    else {
      data[1] = "";
    }
    if (fs.existsSync(loginfile)) {
      data[2] = fs.readFileSync(loginfile, {
        encoding: "utf-8",
        flag: "r"
      });
    }
    else {
      data[2] = "";
    }
    let encryptedpasswd = fs.readFileSync(passwdfile, {
      encoding: "utf-8",
      flag: "r"
    });
    data[3] = decrypt(encryptedpasswd);
    if (fs.existsSync(imagefile)) {
      data[4] = imagefile;
    }
    else {
      data[4] = "";
    }

    win.webContents.send("showedElement", data);
  }
  else {
    let data = [];
    data[0] = args;
    let path = pwmanDir + "\\" + args;
    let urlfileExsists = false;
    let loginfileExists = false;
    let imagefileExists = false;
    let keyfileExists = false;
    let urlfile = path + "\\url.txt";
    let loginfile = path + "\\login.txt";
    let imagefile = path + "\\image.png";
    let passwdfile = path + "\\passwd.pw";
    let keyfile = path + "\\";
    let decryptedkeyfile;
    let keyfileName;
    fs.readdirSync(path).forEach(file => {
      if (file === "url.txt") {
        urlfileExsists = true;
      }
      if (file === "login.txt") {
        loginfileExists = true;
      }
      if (file === "image.png") {
        imagefileExists = true;
      }
      if (file.includes("cle")) {
        keyfileExists = true;
        decryptedkeyfile = keyfile + file.replace(/.pw/g, ""); 
        keyfile += file;
        keyfileName = file.replace(/.pw/g, "");
      }
    });
    if (urlfileExsists) {
      data[1] = fs.readFileSync(urlfile, {
        encoding: "utf-8",
        flag: "r"
      });
    }
    else {
      data[1] = "";
    }
    if (loginfileExists) {
      data[2] = fs.readFileSync(loginfile, {
        encoding: "utf-8",
        flag: "r"
      });
    }
    else {
      data[2] = "";
    }
    let encryptedpasswd = fs.readFileSync(passwdfile, {
      encoding: "utf-8",
      flag: "r"
    });
    data[3] = decrypt(encryptedpasswd);
    if (imagefileExists) {
      data[4] = imagefile;
    }
    else {
      data[4] = "";
    }
    let encryptedKeyFile;
    if (keyfileExists) {
      data[5] = true;
      encryptedKeyFile = fs.readFileSync(keyfile, {
        encoding: "utf-8",
        flag: "r"
      });
      fs.writeFileSync(decryptedkeyfile, decrypt(encryptedKeyFile), {
        encoding: "utf-8",
        flag: "w",
        mode: 0o400
      });
      data[6] = keyfileName;
      data[7] = keyfile;
    }
    win.webContents.send("showedElement", data);
  }
});

ipcMain.on("chooseImage", (event, args) => {
  let image = dialog.showOpenDialogSync(win, {
  filters: [{
    name: "Images", extensions: ["png"]
    }]
  });
  win.webContents.send("chosenImage", image);
});

ipcMain.on("chooseKey", (event, args) => {
  let key = dialog.showOpenDialogSync(win);
  win.webContents.send("chosenKey", key);
})

ipcMain.on("toDelete", (event, args) => {
  if(!isWin) {
    let pathToDel = pwmanDir + "/" + args;
    fs.rmSync(pathToDel, { recursive: true, force: true });
    win.webContents.send("deleted", directory_listing_linux());
  }
  else {
    let pathToDel = pwmanDir + "\\" + args;
    fs.rmSync(pathToDel, { recursive: true, force: true });
    win.webContents.send("deleted", directory_listing_windows());
  }
});

ipcMain.on("openURL", (event, args) => {
  let res = shell.openExternal(args);
  res.then(function (value) {
    win.webContents.send("openedURL", value);
  });
});

ipcMain.on("openFileFromURL", (event, args) => {
  if(!isWin) {
    win.webContents.send("openedURL", "Unimplemented Yet")
  }
  else {
    let res = shell.openPath(args);
    res.then(function (value) {
      win.webContents.send("openedURL", value);
    });
  }
});

ipcMain.on("openPutty", (event, args) => {
  if(!isWin) {
    win.webContents.send("openedURL", "Not implemented Yet");
  }
  else {
    let name = args[0];
    let cwd = pwmanDir + "\\" + name.replace(/ /g, "_");
    exec(args[1], {cwd: cwd});
  }
});

ipcMain.on("openSSH", (event, args) => {
  if(!isWin) {
    win.webContents.send("openedURL", "Not implemented Yet!");
  }
  else {
    let name = args[0];
    let cwd = pwmanDir + "\\" + name.replace(/ /g, "_");
    spawn("ssh", args[1].split(" "), {
      cwd: cwd,
      shell: true,
      detached: true});
  }
})

ipcMain.on("chooseImageModify", (event, args) => {
  let image = dialog.showOpenDialogSync(win, {
  filters: [{
    name: "Images", extensions: ["png"]
    }]
  });

  win.webContents.send("chosenImageModify", image);
});

ipcMain.on("chooseKeyModify", (event, args) => {
  let key = dialog.showOpenDialogSync(win);
  win.webContents.send("chosenKeyModify", key);
});

ipcMain.on("modificationConfirmed", (event, args) => {
  if (!isWin) {
    let path = pwmanDir + "/" + args[0];
    let newPath = pwmanDir + "/" + args[1];
    if(path === newPath) {
      let newUrl = args[2];
      let urlFile = path + "/url.txt";
      if (newUrl !== "") {
        allow_write_permission(urlFile);
        fs.writeFileSync(urlFile, newUrl, {
          encoding: "utf-8",
          flag: "w",
          mode: 0o400
        });
      }
      let newPathImage = args[3];
      let pathImageFile = path + "/image.png";
      if(newPathImage !== "" && newPathImage !== "none") {
        fs.copyFileSync(newPathImage, pathImageFile);
      }
      if (newPathImage === "none") {
        fs.rmSync(pathImageFile, {
          force: true
        });
      }
      let newLogin = args[4];
      let loginFile = path + "/login.txt";
      if (newLogin !== "") {
        allow_write_permission(loginFile);
        fs.writeFileSync(loginFile, newLogin, {
          encoding: "utf-8",
          flag: "w",
          mode: 0o400
        });
      }
      let newPasswd = args[5];
      let passwdFile = path + "/passwd.pw";
      if (newPasswd !== "") {
        allow_write_permission(passwdFile);
        fs.writeFileSync(passwdFile, encrypt(newPasswd), {
          encoding: "utf-8",
          flag: "w",
          mode: 0o400
        });
      }
    }
    if (path !== newPath) {
      if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath);
        let newUrl = args[2];
        let urlFile = newPath + "/url.txt";
        if (newUrl !== "") {
          allow_write_permission(urlFile);
          fs.writeFileSync(urlFile, newUrl, {
            encoding: "utf-8",
            flag: "w",
            mode: 0o400
          });
        }
        else {
          let oldUrlFile = path + "/url.txt";
          if (fs.existsSync(oldUrlFile)) {
            fs.copyFileSync(oldUrlFile, urlFile);
          }
        }
        let newPathImage = args[3];
        let pathImageFile = newPath + "/image.png";
        if (newPathImage !== "" && newPathImage !== "none") {
          fs.copyFileSync(newPathImage, pathImageFile);
        }
        if (newPathImage === "") {
          let oldPathImageFile = path + "/image.png";
          if (fs.existsSync(oldPathImageFile)) {
            fs.copyFileSync(oldPathImageFile, pathImageFile);
          }
        }
        let newLogin = args[4];
        let loginFile = newPath + "/login.txt";
        if (newLogin !== "") {
          allow_write_permission(loginFile);
          fs.writeFileSync(loginFile, newLogin, {
            encoding: "utf-8",
            flag: "w",
            mode: 0o400
          });
        }
        else {
          let oldLoginFile = path + "/login.txt";
          if (fs.existsSync(oldLoginFile)) {
            fs.copyFileSync(oldLoginFile, loginFile);
          }
        }
        let newPasswd = args[5];
        let passwdFile = newPath + "/passwd.pw"
        if (newPasswd !== "") {
          allow_write_permission(passwdFile);
          fs.writeFileSync(passwdFile, encrypt(newPasswd), {
            encoding: "utf-8",
            flag: "w",
            mode: 0o400
          });
        }
        else {
          let oldPasswdFile = path + "/passwd.pw";

          fs.copyFileSync(oldPasswdFile, passwdFile);
        }
        fs.rmSync(path, { recursive: true, force: true });
      }
    }
    let res = [];
    res[0] = directory_listing_linux();
    res[1] = args;
    win.webContents.send("modificationDone", res);
  }
  else {
    let path = pwmanDir + "\\" + args[0];
    let newPath = pwmanDir + "\\" + args[1];
    if(path === newPath) {
      let newUrl = args[2];
      let urlFile = path + "\\url.txt";
      if (newUrl !== "") {
        allow_write_permission(urlFile);
        fs.writeFileSync(urlFile, newUrl, {
          encoding: "utf-8",
          flag: "w",
          mode: 0o400
        });
      }
      let newPathImage = args[3];
      let pathImageFile = path + "\\image.png";
      if(newPathImage !== "" && newPathImage !== "none") {
        fs.copyFileSync(newPathImage, pathImageFile);
      }
      if (newPathImage === "none") {
        fs.rmSync(pathImageFile, {
          force: true
        });
      }
      let newLogin = args[4];
      let loginFile = path + "\\login.txt";
      if (newLogin !== "") {
        allow_write_permission(loginFile);
        fs.writeFileSync(loginFile, newLogin, {
          encoding: "utf-8",
          flag: "w",
          mode: 0o400
        });
      }
      let newPasswd = args[5];
      let passwdFile = path + "\\passwd.pw";
      if (newPasswd !== "") {
        allow_write_permission(passwdFile);
        fs.writeFileSync(passwdFile, encrypt(newPasswd), {
          encoding: "utf-8",
          flag: "w",
          mode: 0o400
        });
      }
      let newKey = args[6];
      let keyFile = path + "\\cle";
      if (newKey !== "" && newKey !== "none") {
        let rmkeyfile = path + "\\";
        let toDel = false;
        fs.readdirSync(path).forEach(file => {
          if (file.includes("cle") && (file.includes(".pw"))) {
            rmkeyfile += file;
            toDel = true;
          }
        });
        if (toDel) {
          fs.rmSync(rmkeyfile, { recursive: true, force: true });
        }
        let dataKey = fs.readFileSync(newKey, {
          encoding: "utf-8",
          flag: "r"
        });
        let indexForName = 0;
        let indexForExt = 0;
        let revIndexForExt;
        let argsToString = args[6].toString();
        for (let i= argsToString.length - 1; i>=0; i--) {
          if (argsToString[i] === "\\" && indexForName === 0) {
            indexForName = i;
          }
          if (argsToString[i] === "." && indexForExt === 0 && indexForName === 0) {
            indexForExt = i;
          }
        }
        if (indexForExt !== 0) {
          revIndexForExt = (argsToString.length) - (argsToString.length - indexForExt - 1);
          keyFile +=  "." + argsToString.substring(revIndexForExt);
        }        
        keyFile += ".pw";
        fs.writeFileSync(keyFile, encrypt(dataKey), {
          encoding: "utf-8",
          flag: "w",
          mode: 0o400
        });
      }
      if (newKey === "none") {
        let rmkeyfile = path + "\\";
        let toDel = false;
        fs.readdirSync(path).forEach(file => {
          if (file.includes("cle") && (file.includes(".pw"))) {
            rmkeyfile += file;
            toDel = true;
          }
        });
        if (toDel) {
          fs.rmSync(rmkeyfile, { recursive: true, force: true });
        }
      }
    }
    if (path !== newPath) {
      if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath);
        let newUrl = args[2];
        let urlFile = newPath + "\\url.txt";
        if (newUrl !== "") {
          allow_write_permission(urlFile);
          fs.writeFileSync(urlFile, newUrl, {
            encoding: "utf-8",
            flag: "w",
            mode: 0o400
          });
        }
        else {
          let oldUrlFile = path + "\\url.txt";
          if (fs.existsSync(oldUrlFile)) {
            fs.copyFileSync(oldUrlFile, urlFile);
          }
        }
        let newPathImage = args[3];
        let pathImageFile = newPath + "\\image.png";
        if (newPathImage !== "" && newPathImage !== "none") {
          fs.copyFileSync(newPathImage, pathImageFile);
        }
        if (newPathImage === "") {
          let oldPathImageFile = path + "\\image.png";
          if (fs.existsSync(oldPathImageFile)) {
            fs.copyFileSync(oldPathImageFile, pathImageFile);
          }
        }
        let newLogin = args[4];
        let loginFile = newPath + "\\login.txt";
        if (newLogin !== "") {
          allow_write_permission(loginFile);
          fs.writeFileSync(loginFile, newLogin, {
            encoding: "utf-8",
            flag: "w",
            mode: 0o400
          });
        }
        else {
          let oldLoginFile = path + "\\login.txt";
          if (fs.existsSync(oldLoginFile)) {
            fs.copyFileSync(oldLoginFile, loginFile);
          }
        }
        let newPasswd = args[5];
        let passwdFile = newPath + "\\passwd.pw"
        if (newPasswd !== "") {
          allow_write_permission(passwdFile);
          fs.writeFileSync(passwdFile, encrypt(newPasswd), {
            encoding: "utf-8",
            flag: "w",
            mode: 0o400
          });
        }
        else {
          let oldPasswdFile = path + "\\passwd.pw";
          fs.copyFileSync(oldPasswdFile, passwdFile);
        }
        let newKey = args[6];
        let keyFile = newPath + "\\cle";
        if (newKey !== "" && newKey !== "none") {
          let dataKey = fs.readFileSync(newKey, {
            encoding: "utf-8",
            flag: "r"
          });
          let indexForName = 0;
          let indexForExt = 0;
          let revIndexForExt;
          let argsToString = args[6].toString();
          for (let i= argsToString.length - 1; i>=0; i--) {
            if (argsToString[i] === "\\" && indexForName === 0) {
              indexForName = i;
            }
            if (argsToString[i] === "." && indexForExt === 0 && indexForName === 0) {
              indexForExt = i;
            }
          }
          if (indexForExt !== 0) {
            revIndexForExt = (argsToString.length) - (argsToString.length - indexForExt - 1);
            keyFile +=  "." + argsToString.substring(revIndexForExt);
          }        
          keyFile += ".pw";
        
          fs.writeFileSync(keyFile, encrypt(dataKey), {
            encoding: "utf-8",
            flag: "w",
            mode: 0o400
          });
        }
        if (newKey === "") {
          let oldPathKey = path + "\\";
          let newPathKey = newPath + "\\";
          let toCopy = false;
          fs.readdirSync(path).forEach(file => {
            if (file.includes("cle") && (file.includes(".pw"))) {
              oldPathKey += file;
              newPathKey += file;
              toCopy = true;
            }
          });
          if (toCopy) {
            fs.copyFileSync(oldPathKey, newPathKey);
          }
        }
        fs.rmSync(path, { recursive: true, force: true });
      }
    }
    let res = [];
    res[0] = directory_listing_windows();
    res[1] = args;
    win.webContents.send("modificationDone", res);
  }
});

ipcMain.on("closeElement", (event, args) => {
  if(!isWin) {
    //
  }
  else {
    let path = pwmanDir + "\\" + args;
    let rmkeyfile = path + "\\";
    toDel = false;
    fs.readdirSync(path).forEach(file => {
      if (file.includes("cle") && !(file.includes(".pw"))) {
        rmkeyfile += file;
        toDel = true;
      }
    });
    if (toDel) {
      fs.rmSync(rmkeyfile, { recursive: true, force: true });
    }
  }
})