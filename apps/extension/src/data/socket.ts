const sendQuestRequest = [
  "request",
  ["FriendQuestsController.getSendQuestDataWsAction", [2656515], 1013, 916],
];

const sendQuestResponseFull = [
  "response",
  [
    1013,
    1,
    [
      {
        id: 2656515,
        username: "adam eve",
        country: "IL",
        allowFriendQuests: 1,
      }, //Ueer Details
      true, // Slots Full
      [], // Favorite List
      false,
    ],
  ],
];

const sendQuestResponseAvailable = [
  "response",
  [
    1021,
    1,
    [
      {
        id: 12034678,
        username: "Aethero|Flotto",
        country: "ID",
        allowFriendQuests: 1,
      },
      false, // Slots Full
      [], // Favorite List
      false,
    ],
  ],
];

const closeChannelRequest = [
  "request",
  ["ChatController.closeChannelWsAction", ["31002034"], 0, 916],
];
