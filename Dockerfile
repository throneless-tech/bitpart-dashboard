####################################################################################################
## Builder
####################################################################################################
FROM node:lts-alpine as base

# Set the working directory inside the container to /app.
# We need to set the working directory so Docker knows where to run the commands.
WORKDIR /app

# Copy the package.json file to the working directory in the container.
# This command is necessary for Docker to install project dependencies.
COPY package*.json ./

# Install project dependencies
RUN npm install

ENV NODE_ENV production

# Disable telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED 1

# set up prisma ORM
COPY ./prisma/schema.prisma ./prisma/schema.prisma

# Generate Prisma client
RUN npx prisma generate

# Push changes to DB
# RUN npx prisma db push

# Copy all files from the context directory (where the Dockerfile is located) to the working directory in the container.
COPY . .

# build the project
RUN npm run build

EXPOSE 3000

# Define the default command to be executed when the container is started
CMD ["npm", "start"]

# 
# thanks to 
# https://medium.com/@renanleonel/dockerizing-next-js-a3d9c51c0182
# for reference