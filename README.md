# volume-backend

An open-sourced backend for Volume, a news aggregator for Cornell's publications
and magazines. Made by [Cornell AppDev](cornellappdev.com).

Tech stack:

1. Typescript/Node.js
2. MongoDB
3. GraphQL

## Installation

To run this project, you must have [Node.js](https://nodejs.org/en/download/) and [Typescript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) installed on your machine.

Clone the project with

`git clone https://github.com/cuappdev/volume-backend.git`

After cloning the project `cd` into the new directory run

`git config core.hooksPath .github/hooks`

and install dependencies with

`npm install`

We use `direnv` to keep track of environment variables. Install `direnv` to your machine.
Then, to start the project, run the following terminal commands:
`direnv allow` 

`eval "$(direnv hook zsh)"`


## Setting up the database

Make sure `MongoDB` is installed. [See installation guide](https://docs.mongodb.com/manual/installation/).

To run MongoDB on a MacOS device, run

`brew services start mongodb-community@6.0` (6.0 may be outdated, check website for updated version).

and connect MongoSH to a running instance using

`mongosh`

From here, you can interact with your database by typing `use <db_name>`.

If you are using VSCode, we recommend installing the MongoDB extension to allow you to interact with documents in your database straight through the editor. More information on this [here](https://code.visualstudio.com/docs/azure/mongodb).

## Environment variables

We recommend using [`direnv`](https://direnv.net/). To set up, run the following:

`cp .envrctemplate .envrc`

## Configuration(optional)

We recommend using ESLint and Prettier for linting/formatting. If you are using VSCode, they can be downloaded directly through the Extensions panel. Run ESLint on the codebase with `npm run lint` and Prettier with `npm run format`.
