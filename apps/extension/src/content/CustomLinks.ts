const _observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    const addedNodes = Array.from(mutation.addedNodes);
    addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        // Element node
        const anchors = Array.from((node as HTMLElement).querySelectorAll<HTMLAnchorElement>(`a[href*="/start/"]`));

        anchors.forEach((a) => {
          const res = /^(\d+)x(\d+)\/(\d+)$/.exec(a.innerText);
          if (res) {
            const width = parseInt(res[1]);
            const height = parseInt(res[2]);
            const mines = parseInt(res[3]);

            const percent = (mines / (width * height)) * 100;

            a.innerText = `${width}x${height}/${mines} @ ${percent.toFixed(1)}%`;
            //a.style.fontSize = "0.85em";
          }
        });
      }
    });
  });
});

export default {
  mount: () => {
    _observer.observe(document, { childList: true, subtree: true });
  },
};
