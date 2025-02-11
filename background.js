// dynamic rules を更新する関数
function updateBlockRules(urls) {
  // まず、現在設定されている動的ルールを取得
  chrome.declarativeNetRequest.getDynamicRules((currentRules) => {
    const currentIds = currentRules.map((rule) => rule.id);

    // 各URLパターンに対してルールを作成（ここでは rule id は 100 番台を利用）
    const newRules = urls.map((url, index) => {
      return {
        id: 100 + index,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { extensionPath: "/block.html" },
        },
        condition: {
          urlFilter: url,
          resourceTypes: ["main_frame"],
        },
      };
    });

    // 現在の動的ルールをすべて削除してから新ルールを追加
    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: currentIds,
        addRules: newRules,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("ルール更新エラー:", chrome.runtime.lastError.message);
        } else {
          console.log("動的ルール更新完了:", newRules);
        }
      }
    );
  });
}

// 拡張機能がインストール（または更新）されたときに、保存済みのブロック URL でルールを更新
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["blockUrls"], (data) => {
    const urls = data.blockUrls || [];
    updateBlockRules(urls);
  });
});

// options.html から送信されるメッセージを受け取る
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "updateRules" && Array.isArray(message.urls)) {
    updateBlockRules(message.urls);
    sendResponse({ status: "ok" });
  }
});
