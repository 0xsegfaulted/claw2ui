FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ src/
COPY bin/ bin/
COPY templates/ templates/

RUN npx tsc

# HF Space expects port 7860
ENV CLAWBOARD_PORT=7860
ENV CLAWBOARD_BIND=0.0.0.0
ENV CLAWBOARD_NO_TUNNEL=1
ENV CLAWBOARD_TRUST_PROXY=1

EXPOSE 7860

CMD ["node", "dist/server.js"]
