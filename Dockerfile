# Dockerfile
# ----------
# Build and test the TDG project in a clean Docker image.
# We use node:20-alpine for a small, fast image.
# The image will run the Jest test suite automatically during the build step.

# --------------------------------------------------
# 1️⃣ Builder Stage – install deps and run tests
# --------------------------------------------------
FROM node:20-alpine AS builder

# Set the working directory inside the image.
WORKDIR /app

# Copy only the package descriptor files first; this allows Docker to cache
# the npm install step unless dependencies change.
COPY package.json package-lock.json* ./

# Install dependencies. Using --frozen-lockfile ensures the image builds
# deterministically.
RUN npm ci

# Copy the rest of the source into the image.
COPY . .

# Run the automated tests. If any test fails the build will abort.
RUN npm test

# ... after RUN npm test
RUN npm run build

# --------------------------------------------------
# 2️⃣ Runtime Stage – minimal image for running the app
# --------------------------------------------------
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app .

# Set an entrypoint that runs the server or the demo
# For the purpose of this container we simply start the dev server
# (change the command if you have a different script).
CMD ["npm", "start"]
