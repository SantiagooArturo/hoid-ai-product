chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_TABS') {
    chrome.tabs.query({}, (tabs) => {
      const formattedTabs = tabs.map(tab => ({
        id: tab.id.toString(),
        title: tab.title,
        url: tab.url
      }))
      sendResponse(formattedTabs)
    })
    return true // Will respond asynchronously
  }
}) 