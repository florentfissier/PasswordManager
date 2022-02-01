const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
	"api", {
		send: (channel, data) => {
			//whiteliste channel
			let validChannels = ["toMain", "createPasswd", "checkPasswd", "addElement", 
								"showElement", "chooseImage", "chooseKey", "toDelete", 
								"openURL", "openFileFromURL", "openSSH", "openPutty", 
								"modifyElement", "chooseImageModify", "chooseKeyModify", 
								"closeElement",	"modificationConfirmed", "firstTime"];
			if (validChannels.includes(channel)) {
				ipcRenderer.send(channel, data);
			}
		},
		receive: (channel, func) => {
			let validChannels = ["fromMain", "createdPasswd", "checkedPasswd", "addedElement", 
								"showedElement", "chosenImage", "chosenKey", "deleted", 
								"openedURL", "modifiedElement", "chosenImageModify", 
								"chosenKeyModify","modificationDone", "firstTime"];
			if (validChannels.includes(channel)) {
				ipcRenderer.on(channel, (event, ...args) => func(...args));
			}
		}
	});