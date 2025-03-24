FROM node:alpine AS dev

WORKDIR /app

COPY package*.json .
COPY drizzle.config.ts .

RUN npm install

COPY . .

EXPOSE 5000

CMD [ "npm","run","dev"]

FROM dev AS builder
WORKDIR /app  # Added missing WORKDIR
COPY --from=dev /app ./  

RUN npm run build

FROM node:alpine AS prod
WORKDIR /app

# Copy only necessary files for production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/README.md ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules 

# Expose production port
EXPOSE 5000

# Start production server
CMD ["npm", "start"]

