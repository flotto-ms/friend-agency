import QuestPage from "./content/QuestPage";

let path: string = "";

setInterval(() => {
  if (path === window.location.pathname) {
    return;
  }
  if (path === QuestPage.path) {
    QuestPage.unmount();
  } else if (window.location.pathname === QuestPage.path) {
    QuestPage.mount();
  }
  path = window.location.pathname;
}, 500);

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  console.log("Message received");
});
