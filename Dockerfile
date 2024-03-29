ARG PORT=3004
ARG PARENT_VERSION=2.1.2-node18.11.0

# Development
FROM defradigital/node-development:${PARENT_VERSION} AS development
ARG PORT
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}

ARG PORT_DEBUG=9229
ENV PORT ${PORT}
EXPOSE ${PORT} ${PORT_DEBUG}

COPY --chown=node:node package*.json ./
COPY --chown=node:node ./scripts/ ./scripts/
RUN npm install
COPY --chown=node:node . .
CMD [ "npm", "run", "start:watch" ]

# Production
FROM defradigital/node:${PARENT_VERSION} AS production
ARG PARENT_VERSION
ARG PORT
LABEL uk.gov.defra.ffc.parent-image=defradigital/node:${PARENT_VERSION}

ENV PORT ${PORT}
EXPOSE ${PORT}

COPY --from=development /home/node/package*.json /home/node/
COPY --from=development /home/node/app  /home/node/app
RUN npm ci
CMD [ "node", "app" ]
