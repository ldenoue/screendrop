
chrome.runtime.onMessage.addListener(requestCallback);

/*chrome.storage.sync.get({
    handlePDF: false,
    saveLocally: false,
    saveChromeBookmarks: true,
  }, function(items) {
  if (items)
  {
    handlePDF = items.handlePDF;
    saveLocally = items.saveLocally;
    saveChromeBookmarks = items.saveChromeBookmarks;
  }
});*/

/*chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes)
  {
    var storageChange = changes[key];
    if (key === 'handlePDF')
    {
      handlePDF = storageChange.newValue;
    }
    if (key === 'saveLocally')
    {
      saveLocally = storageChange.newValue;
    }
    if (key === 'saveChromeBookmarks')
    {
      saveChromeBookmarks = storageChange.newValue;
    }
  }
});*/

//yawas_setStatusIcon("off");

chrome.contextMenus.create({
                           "id" : "yellow",
                           "title" : "Yellow",// (Ctrl-Shift-Y)",
                           "type" : "normal",
                           "contexts" : ["selection"],
                           "onclick" : getClickHandler()
                           });
chrome.contextMenus.create({
                           "id" : "red",
                           "title" : "Red",// (Ctrl-Shift-R)",
                           "type" : "normal",
                           "contexts" : ["selection"],
                           "onclick" : getClickHandler()
                           });
chrome.contextMenus.create({
                           "id" : "blue",
                           "title" : "Blue",// (Ctrl-Shift-B)",
                           "type" : "normal",
                           "contexts" : ["selection"],
                           "onclick" : getClickHandler()
                           });
chrome.contextMenus.create({
                           "id" : "green",
                           "title" : "Green",// (Ctrl-Shift-G)",
                           "type" : "normal",
                           "contexts" : ["selection"],
                           "onclick" : getClickHandler()
                           });

chrome.contextMenus.create({
                           "id" : "note",
                           "title" : "Comment",// (Ctrl-Shift-C)",
                           "type" : "normal",
                           "contexts" : ["selection"],
                           "onclick" : getClickHandler()
                           });

chrome.contextMenus.create({
                           "id" : "delete",
                           "title" : "Delete",// (Ctrl-Shift-D)",
                           "type" : "normal",
                           "contexts" : ["selection"],
                           "onclick" : getDeleteHandler()
                           });

chrome.contextMenus.create({
                           "id" : "copyclipboard",
                           "title" : "Copy",
                           "type" : "normal",
                           "contexts" : ["page"],
                           "onclick" : getCopyClipboardHandler()
                           });

chrome.contextMenus.create({
                           "id" : "email",
                           "title" : "Email",
                           "type" : "normal",
                           "contexts" : ["page"],
                           "onclick" : getEmailHandler()
                           });

chrome.contextMenus.create({
                           "id" : "search",
                           "title" : "Search",
                           "type" : "normal",
                           "contexts" : ["page"],
                           "onclick" : getSearchHandler()
                           });
chrome.contextMenus.create({
                           "id" : "edit",
                           "title" : "Edit",
                           "type" : "normal",
                           "contexts" : ["page"],
                           "onclick" : getEditHandler()
                           });

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'sd-yellow')
    sendMessageActiveTab({action:'yawas_chrome',color:'yellow'});
  else if (command === 'sd-red')
    sendMessageActiveTab({action:'yawas_chrome',color:'red'});
  else if (command === 'sd-blue')
    sendMessageActiveTab({action:'yawas_chrome',color:'blue'});
  else if (command === 'sd-green')
    sendMessageActiveTab({action:'yawas_chrome',color:'green'});
  else if (command === 'sd-delete')
    sendMessageActiveTab({action:'yawas_delete_highlight'});
  else if (command === 'sd-note')
    sendMessageActiveTab({action:'yawas_chrome',color:'note'});
});
