chrome.commands.onCommand.addListener(function(command) {
  if (command === "open-memo") {
    chrome.action.openPopup();
  } else if (command === "save-url") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentUrl = tabs[0].url;
      const currentTitle = tabs[0].title;
      
      chrome.storage.local.get(['urls'], function(result) {
        const urls = result.urls || [];
        
        if (urls.length >= 3) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: '提示',
            message: '请先删除一条网址再继续添加'
          });
          return;
        }
        
        if (!urls.some(item => item.url === currentUrl)) {
          urls.unshift({
            url: currentUrl,
            title: currentTitle,
            note: currentTitle
          });
          chrome.storage.local.set({ urls });
        }
      });
    });
  }
}); 