document.addEventListener('DOMContentLoaded', () => {
  const tabList = document.getElementById('tabList')

  // Get tabs from background script
  chrome.runtime.sendMessage({ type: 'GET_TABS' }, (tabs) => {
    tabs.forEach(tab => {
      const tabElement = document.createElement('div')
      tabElement.className = 'tab-item'
      tabElement.textContent = tab.title
      tabElement.addEventListener('click', () => {
        // Send selected tab to the web app
        fetch('http://localhost:3000/api/tabs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tab)
        })
        window.close()
      })
      tabList.appendChild(tabElement)
    })
  })
}) 