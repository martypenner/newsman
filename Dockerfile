# Use the official Node 18 image as a base
FROM node:18

# Install pnpm
RUN npm install -g pnpm@8.9.2

# Create a non-root user 'node' (already exists in official Node image)
# Set working directory in the container and change ownership
WORKDIR /app
RUN chown node:node /app

# Switch to non-root user
USER node

# Copy pnpm's lock file and json
COPY --chown=node:node pnpm-lock.yaml package.json ./

# Install SvelteKit and other project dependencies using pnpm
RUN pnpm install && \
	# Clean up pnpm cache (though it's usually shared)
	pnpm store prune

# Copy local code to the container
COPY --chown=node:node . .

# Build the SvelteKit app using pnpm
RUN pnpm run build

# Start the SvelteKit app
CMD ["node", "build"]
