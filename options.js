document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("blockForm");
  const textarea = document.getElementById("urls");

  // 保存済みのブロックURLを読み込む
  chrome.storage.sync.get(["blockUrls"], (data) => {
    if (data.blockUrls && Array.isArray(data.blockUrls)) {
      textarea.value = data.blockUrls.join("\n");
    }
  });

  // フォーム送信時の処理
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // テキストエリアの内容を1行ずつに分解し、空行は除外
    const urls = textarea.value
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
    // 保存
    chrome.storage.sync.set({ blockUrls: urls }, () => {
      console.log("ブロックURLを保存しました:", urls);
      // 背景スクリプトに動的ルール更新のメッセージを送信
      chrome.runtime.sendMessage(
        { type: "updateRules", urls: urls },
        (response) => {
          console.log("ルール更新の応答:", response);
        }
      );
    });
  });
});
