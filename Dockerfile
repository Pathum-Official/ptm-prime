FROM node:18-alpine

WORKDIR /app

# Copy package management files
COPY package.json package-lock.json* ./

# Install dependencies cleanly
RUN npm ci

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000

# Start server
CMD ["npm", "run", "start"]
