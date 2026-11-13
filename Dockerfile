FROM node:22-slim              # mulai dari Linux yang sudah ada Node 22
RUN apt-get install openssl    # dibutuhkan Prisma
WORKDIR /app
COPY package*.json ./
RUN npm ci                     # = npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
CMD npx prisma migrate deploy && node src/server.js   # migrasi, lalu nyalakan server