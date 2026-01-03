# Use Node.js 18 as the base image
FROM node:18-bullseye

# Install Java 17 (Required for Lavalink)
RUN apt-get update && \
    apt-get install -y openjdk-17-jre-headless && \
    apt-get clean;

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bot/package*.json ./bot/

# Install dependencies
RUN npm install
RUN cd bot && npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Expose ports (3000 for Website, 2333 for Lavalink)
EXPOSE 3000 2333

# Create a start script to run both Lavalink and the App
RUN echo '#!/bin/bash\n\
# Start Lavalink in the background\n\
if [ -f "Lavalink.jar" ]; then\n\
  echo "Starting Lavalink..."\n\
  java -jar Lavalink.jar &\n\
else\n\
  echo "Lavalink.jar not found, skipping local node..."\n\
fi\n\
\n\
# Wait a few seconds for Lavalink to initialize\n\
sleep 5\n\
\n\
# Run database migrations (deploy mode)\n\
echo "Running database migrations..."\n\
npx prisma migrate deploy\n\
\n\
# Start the Next.js App (which starts the Bot)\n\
echo "Starting Application..."\n\
npm start\n\
' > start.sh

RUN chmod +x start.sh

# Start the application
CMD ["./start.sh"]
