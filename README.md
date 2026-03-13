# Funny Maze Escape / 搞笑迷宮大逃走

這是一個給 `3-6` 歲小朋友玩的迷宮網站遊戲。

玩家可以選擇幫 `小老鼠` 或 `小熊` 逃出迷宮。路上有搞笑的 `噴水陷阱`，一踩中就會被噴濕，然後回到起點重新挑戰。現在每次開始都會 `隨機生成新迷宮`，而且保證 `一定可以走到出口`；過關後下一個迷宮也會變得更大。

This is a kid-friendly maze website for ages `3-6`.

Players can help a `little mouse` or `little bear` escape a funny maze. Along the way, silly `water traps` may splash them and send them back to the start. Every run now creates a `random maze`, it is always `solvable`, and each win unlocks a `bigger maze`.

## 功能

- 小老鼠 / 小熊角色選擇
- 中文 / English 即時切換
- 簡單 / 普通 / 困難 難度選擇
- 大按鈕和方向鍵控制
- 三個固定迷宮關卡
- 每次都會隨機生成可通關迷宮
- 過關後迷宮會變大
- 噴水陷阱、起點與出口
- 適合幼兒的可愛視覺風格
- 手機畫面優化，按鈕和迷宮格更易操作
- 可執行的單元測試

## 操作方式

1. 直接打開 `index.html`
2. 選擇角色
3. 選擇 `簡單 / 普通 / 困難`
4. 使用畫面箭咀按鈕或鍵盤方向鍵移動
5. 踩到 `💦` 會回到起點
6. 到達 `🧀` 或 `🍯` 就可以過關
7. 可按「開啟背景音效」播放輕鬆搞笑背景音樂
8. 可隨時切換 `中文 / English`
9. 過關後按更大迷宮，會自動生成更大的新地圖

## GitHub Pages

- 線上網址：`https://spacemichael.github.io/maze-game-kids/`

## 測試

使用 Node 內建測試：

```powershell
node --test .\gameLogic.test.js
```

測試會檢查：

- 隨機生成的迷宮是否仍然有路到出口
- 撞牆、踩陷阱、到達出口是否正常
- 過關後下一關是否真的變大
- 不同難度是否真的影響迷宮大小

## 適合用途

- 幼兒迷宮入門遊戲
- 親子互動
- 網站遊戲 Demo
