FROM node:22-slim

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy env file for production use 
#if you use in DEV pls command this
COPY .env ./

# Expose the port
EXPOSE 80

# Start the application
CMD ["npm", "start"]
