####################################################################################################
## Builder
####################################################################################################
FROM node:alpine AS base

# Set the working directory inside the container to /app.
# We need to set the working directory so Docker knows where to run the commands.
WORKDIR /app

# Copy the package.json file to the working directory in the container.
# This command is necessary for Docker to install project dependencies.
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy all files from the context directory (where the Dockerfile is located) to the working directory in the container.
COPY . .

# build the project
RUN npm run build

####################################################################################################
## Final image
####################################################################################################
FROM node:alpine as release

WORKDIR /app

# # Copy the node_modules folder from the base stage to the node_modules directory in the release stage.
COPY --from=base /app/node_modules ./node_modules

# # Copy the package.json file from the base stage to the current directory in the release stage.
COPY --from=base /app/package.json ./package.json

# # Copy the .next folder from the base stage to the .next directory in the release stage.
COPY --from=base /app/.next ./.next

EXPOSE 3000

# Define the default command to be executed when the container is started
CMD ["npm", "start"]

# 
# thanks to 
# https://medium.com/@renanleonel/dockerizing-next-js-a3d9c51c0182
# for reference