console.log("Content Script");
chrome.runtime.onMessage.addListener((request, sender, callback) => {
  console.log("Message Recevied");
  console.log(request, sender, callback);
});
