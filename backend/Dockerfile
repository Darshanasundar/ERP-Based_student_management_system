FROM node:20-alpine

WORKDIR /app

# Copy package manifests first for caching layers
COPY package*.json ./

RUN npm install --production=false

# Copy application source code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
