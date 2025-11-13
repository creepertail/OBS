# Dockerfile for NestJS Backend

# --- Stage 1: Build the application ---
# 使用 Node.js 22 的輕量級 Alpine 版本作為基礎映像
FROM node:22-alpine AS builder

# 在容器內設定工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝所有依賴，包括開發依賴
RUN npm install

# 複製所有原始碼
COPY . .

# 執行建置指令，將 TypeScript 編譯成 JavaScript
RUN npm run build

# --- Stage 2: Create the final production image ---
# 使用一個乾淨的 Node.js 映像
FROM node:22-alpine

WORKDIR /usr/src/app

# 只從 'builder' 階段複製必要的 node_modules 和建置好的 'dist' 目錄
# 這會讓最終的映像檔更小、更安全
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# 向 Docker 聲明容器在執行時將監聽 3000 端口
EXPOSE 3000

# 容器啟動時執行的指令：用 node 運行編譯好的主程式
CMD ["node", "dist/main"]
