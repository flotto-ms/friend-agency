let contractors;
let suppliers;

document.addEventListener("DOMContentLoaded", function () {
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

  const getUsers = async (type) => {
    startLoading();
    return fetch(`https://flotto.vercel.app/api/users?access=${type}`)
      .then((r) => r.json())
      .then((r) => r.users.sort((a, b) => a.username.localeCompare(b.username)))
      .finally(() => stopLoading());
  };

  // Fetch and display the Contractors list
  const showContractorsList = async () => {
    contractorsUl.innerHTML = "";
    if (!contractors) {
      contractors = await getUsers("contractor");
    }

    contractors.forEach((contractor) => {
      const listItem = document.createElement("li");
      const profileLink = document.createElement("a");
      profileLink.href = `https://minesweeper.online/player/${contractor.id}`;
      profileLink.textContent = contractor.username;
      profileLink.target = "_blank";
      listItem.appendChild(profileLink);
      contractorsUl.appendChild(listItem);
    });
  };

  // Fetch and display the Clients list
  const showClientsList = async () => {
    clientsUl.innerHTML = "";
    if (!suppliers) {
      suppliers = await getUsers("supplier");
    }

    suppliers.forEach((client) => {
      const listItem = document.createElement("li");
      const profileLink = document.createElement("a");
      profileLink.href = `https://minesweeper.online/player/${client.id}`;
      profileLink.textContent = client.username;
      profileLink.target = "_blank";
      listItem.appendChild(profileLink);
      clientsUl.appendChild(listItem);
    });
  };

  // Initially show the contractors list when the popup is loaded
  showContractorsList();

  fetch("https://flotto.vercel.app/extension.json")
    .then((r) => r.json())
    .then((r) => {
      const heading = document.querySelector("h3");
      const notice = document.getElementById("notices");
      const link = document.getElementById("applyLink");

      if (link) {
        link.href = r.applyLink;
      }
      heading.textContent = r.title;
      notice.textContent = r.message;
    });
});
