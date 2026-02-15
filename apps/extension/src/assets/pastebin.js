javascript: void (function () {
  var indexSrc = "";
  for (var i = 0; i < document.getElementsByTagName("script").length; i++) {
    if (document.getElementsByTagName("script")[i].src.indexOf("index") > 0) {
      indexSrc = document.getElementsByTagName("script")[i].src;
    }
  }
  req = new XMLHttpRequest();
  req.open("GET", indexSrc);
  req.onreadystatechange = function () {
    if (req.readyState == 4) {
      var jsCode = req.responseText;
      var jsCodeShort = jsCode.substring(6, jsCode.length - 6);
      questReceivedIndex = jsCode.indexOf("quests_received");
      questReceivedStr = jsCode.substring(questReceivedIndex - 80, questReceivedIndex);
      questReceivedStr = questReceivedStr.substring(questReceivedStr.indexOf("this") + 5);
      questReceivedStr = questReceivedStr.substring(0, questReceivedStr.indexOf("."));
      questSentIndex = jsCode.indexOf("quests_sent");
      questSentStr = jsCode.substring(questSentIndex - 80, questSentIndex);
      questSentStr = questSentStr.substring(questSentStr.indexOf("this") + 5);
      questSentStr = questSentStr.substring(0, questSentStr.indexOf("."));
      questDescIndex = jsCode.indexOf('isElite?"E"');
      questDescStr = jsCode.substring(questDescIndex, questDescIndex + 100);
      questDescStr = questDescStr.substring(questDescStr.indexOf(" ") + 1);
      questDescStr = questDescStr.substring(0, questDescStr.indexOf("("));
      questBlockIndex = jsCode.indexOf("QuestsBlock");
      questBlockStr = jsCode.substring(questBlockIndex - 50, questBlockIndex);
      questBlockStr = questBlockStr.substring(questBlockStr.indexOf("var") + 4);
      questBlockStr = questBlockStr.substring(0, questBlockStr.indexOf("="));
      questRewardIndex = jsCode.substring(questDescIndex + 30).indexOf("static") + questDescIndex + 30;
      questRewardStr = jsCode.substring(questRewardIndex - 30, questRewardIndex + 20);
      questRewardStr1 = questRewardStr.substring(questRewardStr.indexOf("var") + 4);
      questRewardStr1 = questRewardStr1.substring(0, questRewardStr1.indexOf("="));
      questRewardStr2 = questRewardStr.substring(questRewardStr.indexOf("static") + 7);
      questRewardStr2 = questRewardStr2.substring(0, questRewardStr2.indexOf("("));
      questRewardIndex2 = jsCode.indexOf("global_quest_reward");
      questRewardStr3 = jsCode.substring(questRewardIndex2, questRewardIndex2 + 100);
      questRewardStr3 = questRewardStr3.substring(questRewardStr3.indexOf("this") + 5);
      questRewardStr3 = questRewardStr3.substring(0, questRewardStr3.indexOf(")"));
      eval(jsCodeShort);
      setTimeout(function () {
        function a(a) {
          let b = "unknown";
          return (
            a.includes("in a row")
              ? (b = "Win Streak")
              : a.includes("custom")
                ? (b = "Custom")
                : a.includes("efficiency")
                  ? (b = "Efficiency")
                  : a.includes("with no flags")
                    ? (b = "No Flags")
                    : a.includes("arena at level")
                      ? (b = "Arena Level")
                      : a.includes("PvP")
                        ? (b = "PvP")
                        : a.includes("arena coin")
                          ? (b = "Arena Coins")
                          : a.includes("Complete") && a.includes("arena")
                            ? (b = "Arena Specific")
                            : a.includes("honor point") || a.includes("experience")
                              ? (b = "Experience")
                              : a.includes("minecoin")
                                ? (b = "Minecoins")
                                : a.includes("gem")
                                  ? (b = "Gems")
                                  : a.includes("Find")
                                    ? (b = "Gem Specific")
                                    : a.includes("game") && (b = "Wins"),
            b
          );
        }
        function b(a) {
          return ((threedaysago = new Date(a)), new Date(threedaysago.setDate(threedaysago.getDate() - 3)));
        }
        function c(a) {
          let b = document.createElement("DIV");
          return ((b.innerHTML = a), b.textContent || b.innerText || "");
        }
        function getQuestLevel(e) {
          return "L" + e.level + (e.isElite ? "E" : "");
        }
        function getQuestProgress(t) {
          var e = null === t.progress ? 0 : t.progress,
            n = t.options || {};
          return e >= t.required
            ? "Uncollected"
            : 1 == t.required || n.secret || t.type == 25
              ? "—"
              : e + " / " + t.required;
        }
        function d(d, e) {
          quests_data = [];
          for (const f of d) {
            ((quest_data = []),
              "received" == e
                ? ((quest_exp_date = new Date(f.expiresAt)),
                  (quest_exp_date_str = quest_exp_date.toLocaleString("en-GB", { timeZone: "UTC" })),
                  (quest_send_date_str = new Date(f.createdAt).toLocaleString("en-GB", { timeZone: "UTC" })),
                  (quest_is_completed = f.completed),
                  (quest_user_id = f.initiatorId),
                  console.log(quest_exp_date > new Date()))
                : "sent" == e &&
                  ((quest_exp_date = new Date(f.reserveExpiresAt)),
                  (quest_exp_date_str = quest_exp_date.toLocaleString("en-GB", { timeZone: "UTC" })),
                  (quest_send_date_str = b(quest_exp_date).toLocaleString("en-GB", { timeZone: "UTC" })),
                  (quest_is_completed = f.completedByInitiator),
                  (quest_user_id = f.sentTo)),
              console.log(
                quest_exp_date.toLocaleString("en-GB", { timeZone: "UTC" }),
                new Date().toLocaleString("en-GB", { timeZone: "UTC" }),
              ),
              (quest_progress =
                1 == quest_is_completed
                  ? "Completed"
                  : quest_exp_date > new Date()
                    ? getQuestProgress(f)
                    : getQuestProgress(f) == "Uncollected"
                      ? "Uncollected"
                      : "Expired"),
              (quest_level = getQuestLevel(f)),
              (quest_desc = eval(questBlockStr)[questDescStr](f)),
              quest_desc.includes("<") && (quest_desc = c(quest_desc)),
              (quest_type = a(quest_desc)),
              (quest_reward = parseFloat(
                eval(questRewardStr1)
                  [questRewardStr2](f, eval(questBlockStr)[questRewardStr3])[0]
                  .innerText.replace("+", ""),
              )),
              (quest_username = f.username),
              (quest_country = f.country),
              quests_data.push([
                quest_send_date_str,
                quest_exp_date_str,
                quest_progress,
                quest_level,
                quest_desc,
                quest_reward,
                quest_type,
                quest_user_id,
                quest_username,
                quest_country,
              ]));
          }
          return quests_data;
        }
        function exportAttempt() {
          if (eval(questBlockStr)[questReceivedStr] != undefined) {
            var username = document.querySelector(".header_username")?.innerText || "Unknown";
            var dateStr = new Date().toISOString().split("T")[0];
            (console.savecsv(
              d(eval(questBlockStr)[questReceivedStr], "received"),
              username + " - " + dateStr + " - FQ received.csv",
              "received",
            ),
              console.savecsv(
                d(eval(questBlockStr)[questSentStr], "sent"),
                username + " - " + dateStr + " - FQ sent.csv",
                "sent",
              ));
            if (window.xMeta != undefined) {
              currTitle = window.xMeta.title;
            } else {
              currTitle = undefined;
            }
            setTimeout(detectNavigation, 500);
          } else {
            setTimeout(exportAttempt, 500);
          }
        }
        function detectNavigation() {
          if (
            (currTitle == undefined && window.xMeta != undefined) ||
            (currTitle != undefined && window.xMeta.title != currTitle)
          ) {
            window.location.reload();
          } else {
            setTimeout(detectNavigation, 500);
          }
        }
        ((console.savecsv = function (b, c, d) {
          if (!b) {
            return void console.error("Console.save: No data");
          }
          c || (c = "data.csv");
          var f = "";
          let g = 0,
            h = 0,
            i = 0;
          ("object" == typeof b &&
            ((f +=
              "received" == d
                ? '"Date Received (UTC)","Expires at (UTC)","Progress","Level","Description","Reward","Type","Sender ID","Sender Username","Sender Country"\n'
                : '"Date Sent (UTC)","Expires at (UTC)","Progress","Level","Description","Reward","Type","Receiver ID","Receiver Username","Receiver Country"\n'),
            b.forEach((a) => {
              (a.forEach((a) => {
                f += '"' + a + '",';
              }),
                (f = f.slice(0, -1)),
                (f += "\n"),
                "Completed" == a[2] ? (g += a[5]) : "Expired" == a[2] ? (i += a[5]) : (h += a[5]));
            })),
            (f += '\n""' + ',""'.repeat(9)),
            (f += '\n"Event points from completed quests: ","' + g.toString() + '"' + ',""'.repeat(8)),
            (f += '\n"Event points from quests in progress: ","' + h.toFixed(2) + '"' + ',""'.repeat(8)),
            (f += '\n"Event points not gained from expired quests: ","' + i.toFixed(2) + '"' + ',""'.repeat(8)),
            (f += "\n"));
          var j = new Blob([f], { type: "text/csv" }),
            k = document.createEvent("MouseEvents"),
            e = document.createElement("a");
          ((e.download = c),
            (e.href = window.URL.createObjectURL(j)),
            (e.dataset.downloadurl = ["text/csv", e.download, e.href].join(":")),
            k.initMouseEvent("click", !0, !1, window, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null),
            e.dispatchEvent(k));
        }),
          exportAttempt());
      }, 500);
    }
  };
  req.send();
})();
