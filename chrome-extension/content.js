console.log("React Chrome Extension content script loaded!");



//document.body.style.backgroundColor = 'blue';

// see the note below on how to choose currentWindow or lastFocusedWindow
//chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
  //  let url = tabs[0].url;
   // console.log(url)
//});

chrome.tabs.query(null,function(tab) {
    var tablink = tab.url;
    console.log(tablink)
});