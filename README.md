# Puzlr
Puzlr is a simple application to play chess puzzles!
[Give it a spin here.](https://piqued.blog/puzzles)

I've been building this application for a couple key reasons:
1. For fun! I love simple games like [DownForACross](https://downforacross.com/)
1. To demonstrate some of my development skills.

Currently, you can play and reset progress on a _global_ set of puzzles (that's right, you read "global"!).
The dream is to eventually have a _collaborative_ puzzling game, where you make progress on puzzles with friends through consensus.

## Roadmap
1. Authentication and user-scoped games (anonymity still allowed)
1. Consensus-based collaborative games
1. Timed games for some exciting _pressure_!
1. Detailed puzzle metadata and search functionality (e.g. game year)
1. Competitive games with simultaneous puzzling

## Technical Design
1. Isolated reusable functionality in packages ([Yarn workspaces](https://yarnpkg.com/features/workspaces)). Core chess logic is shared between web client and server.
1. Slick CI/CD: [Zero-installs](https://yarnpkg.com/features/zero-installs) for speed, Github actions for automated testing/deployment ([past runs](https://github.com/piqueme/puzlr/actions)), Docker for portable deployments.
1. Self-rolled core chess logic: because I wanted to showcase my development skills! Look at the [beautiful tests](https://github.com/piqueme/puzlr/blob/main/packages/core/src/__tests__/moves.test.ts#L56).
1. GraphQL for flexible querying of _just enough_ data across pages. Also eventually type safety.
1. NGINX for providing a clean reverse proxy with SSL (see [Dockerfile](https://github.com/piqueme/puzlr/blob/main/packages/web/Dockerfile)).
1. React, TypeScript - to use single logic across BE/FE, since there's good community support.

## Current Challenges
1. Some seconds of downtime is required between deployments. Canary setup TBD.
1. UI testing is pretty poor. Likely want to use [Cypress](https://www.cypress.io/) or [Puppeteer](https://github.com/puppeteer/puppeteer).
1. Secrets management is a bit tricky and still modestly manual.
1. Not many server resources; no scaling (but it's still early!).
1. Missing clear monitoring and logging workflows.
1. MongoDB schema and TS models require some reconciliation in code.
1. Duplicate + implicit types for GraphQL contract. Need to setup type generation.
