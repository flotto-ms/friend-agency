document.addEventListener('DOMContentLoaded', function () {
  const toggleListBtn = document.getElementById("toggleListBtn");
  const contractorsListDiv = document.getElementById("contractors-list");
  const clientsListDiv = document.getElementById("clients-list");
  const contractorsUl = document.getElementById("contractors");
  const clientsUl = document.getElementById("clients");
  const spinner = document.getElementById("loading-spinner");

  // Default to showing the Contractors list and hide the Clients list
  contractorsListDiv.style.display = "block";
  clientsListDiv.style.display = "none";
  toggleListBtn.textContent = "Contractors below";

  // Button to toggle between Contractors and Clients lists
  toggleListBtn.addEventListener("click", function () {
    const isClientsVisible = clientsListDiv.style.display === "block";

    // Toggle visibility
    contractorsListDiv.style.display = isClientsVisible ? "block" : "none";
    clientsListDiv.style.display = isClientsVisible ? "none" : "block";

    // Toggle the button text
    toggleListBtn.textContent = isClientsVisible ? "Contractors" : "Clients";

    // Fetch and display the relevant list
    if (isClientsVisible) {
      showContractorsList();
    } else {
      showClientsList();
    }
  });

  // Show spinner
  function startLoading() {
    spinner.style.display = "inline";
  }

  // Hide spinner
  function stopLoading() {
    spinner.style.display = "none";
  }

  // Helper function to fetch and parse CSV data from Google Sheets
  function fetchSheetData(url, callback) {
    startLoading();
    fetch(url)
      .then(response => response.text())
      .then(data => {
        const rows = data.split("\n").slice(1); // Skip header
        const result = rows
          .map(row => row.split(","))
          .filter(cols => cols.length >= 2)
          .map(cols => ({
            name: cols[0].trim().replace(/^"|"$/g, ""),
            ID: cols[1].trim().replace(/^"|"$/g, "")
          }));
        callback(result);
      })
      .catch(error => console.error("Error loading sheet:", error))
      .finally(() => stopLoading());
  }

  // Fetch and display the Contractors list
  function showContractorsList() {
    contractorsUl.innerHTML = "";
    fetchSheetData(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1MzwydHUg80kTDH2Gho73X7lUscSSlvp3-spCqwsuKchPTeXvg-I9seRlU0oMfnae1f6WmIhayXkp/pub?gid=740282782&single=true&output=csv",
      contractors => {
        contractors.forEach(contractor => {
          const listItem = document.createElement("li");
          const profileLink = document.createElement("a");
          profileLink.href = `https://minesweeper.online/player/${contractor.ID}`;
          profileLink.textContent = contractor.name;
          profileLink.target = "_blank";
          listItem.appendChild(profileLink);
          contractorsUl.appendChild(listItem);
        });
      }
    );
  }

  // Fetch and display the Clients list
  function showClientsList() {
    clientsUl.innerHTML = "";
    fetchSheetData(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1MzwydHUg80kTDH2Gho73X7lUscSSlvp3-spCqwsuKchPTeXvg-I9seRlU0oMfnae1f6WmIhayXkp/pub?gid=1372317968&single=true&output=csv",
      clients => {
        clients.forEach(client => {
          const listItem = document.createElement("li");
          const profileLink = document.createElement("a");
          profileLink.href = `https://minesweeper.online/player/${client.ID}`;
          profileLink.textContent = client.name;
          profileLink.target = "_blank";
          listItem.appendChild(profileLink);
          clientsUl.appendChild(listItem);
        });
      }
    );
  }

  // Initially show the contractors list when the popup is loaded
  showContractorsList();

  //Apply link dynamically updated
  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vT1MzwydHUg80kTDH2Gho73X7lUscSSlvp3-spCqwsuKchPTeXvg-I9seRlU0oMfnae1f6WmIhayXkp/pub?gid=1993011804&single=true&output=csv')
  .then(response => response.text())
  .then(text => {
    const firstLine = text.split('\n')[0];
    const applyURL = firstLine.trim();
    const linkEl = document.getElementById('applyLink');
    if (linkEl && applyURL.startsWith('http')) {
      linkEl.href = applyURL;
    }
  })
  .catch(console.error);
  
  // Set <h3> title from sheet
  const heading = document.querySelector("h3");

  fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vT1MzwydHUg80kTDH2Gho73X7lUscSSlvp3-spCqwsuKchPTeXvg-I9seRlU0oMfnae1f6WmIhayXkp/pub?gid=1070080889&single=true&output=csv")
    .then(res => res.text())
    .then(csv => {
      const firstCell = csv.split("\n")[0]?.split(",")[0]?.trim();
      if (firstCell && heading) {
        heading.textContent = firstCell;
      }
    })
    .catch(err => {
      console.error("Failed to fetch heading:", err);
    });
  
  //notice from sheet
  fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vT1MzwydHUg80kTDH2Gho73X7lUscSSlvp3-spCqwsuKchPTeXvg-I9seRlU0oMfnae1f6WmIhayXkp/pub?gid=279342495&single=true&output=csv")
    .then(res => res.text())
    .then(csv => {
      // Match first quoted cell content (allowing multiline inside quotes)
      const match = csv.match(/^"([\s\S]*?)"/);
      let firstCell = "";
      if (match) {
        firstCell = match[1]; // Extracted text inside the quotes
      } else {
        // fallback if no quotes
        firstCell = csv.split(",")[0].trim();
      }

      const noticesEl = document.getElementById("notices");
      if (firstCell && noticesEl) {
        noticesEl.textContent = firstCell; // Use textContent + white-space: pre-line to preserve newlines
      }
    })
    .catch(err => console.error("Failed to fetch notices:", err));

    

});
