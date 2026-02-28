import CustomLinks from "./content/CustomLinks";
import QuestPage from "./content/QuestPage";

const _observer = new MutationObserver(() => {
  QuestPage.unmount();
  if (window.location.pathname === QuestPage.path) {
    QuestPage.mount();
  }
});

_observer.observe(document.getElementById("page")!, {
  childList: true,
  subtree: false,
  attributes: false,
});

CustomLinks.mount();
