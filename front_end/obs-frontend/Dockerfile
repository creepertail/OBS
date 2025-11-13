# Dockerfile for Vue.js Frontend (Development)

# 使用 Node.js 22 的輕量級 Alpine 版本作為基礎映像
FROM node:22-alpine

# 在容器內設定工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json
# (如果 lock 檔案不存在，只複製 package.json)
COPY package*.json ./

# 安裝所有依賴
RUN npm install

# 複製所有原始碼到工作目錄
COPY . .

# 向 Docker 聲明容器在執行時將監聽 5173 端口
EXPOSE 5173

# 容器啟動時執行的指令
# 使用 'npm run dev -- --host' 來確保 Vite 開發伺服器可以從容器外部被存取
CMD ["npm", "run", "dev", "--", "--host"]
