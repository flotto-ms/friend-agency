import { connect, getQuests } from "./minesweeper/api";

connect().then(() => {
  getQuests().then((quests) => {
    console.log(quests);
  });
});
