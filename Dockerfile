FROM node:22-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

CMD ["sh", "-c", "npm run build && npm test && npx cdk synth"]
