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

After cloning the project `cd` into the new directory and install dependencies with 

`npm install`

To run the project, use

`npm run start`

## Setting up the database

Make sure `MongoDB` is installed. [See installation guide](https://docs.mongodb.com/manual/installation/).

To view your database, enter your terminal and run 

`mongo`

From here, you can interact with your database by typing `use <db_name>`.

If you are using VSCode, we recommend installing the MongoDB extension to allow you to interact with documents in your database straight through the editor. More information on this [here](https://code.visualstudio.com/docs/azure/mongodb).

## Environment variables

We recommend using [`direnv`](https://direnv.net/). To set up, run the following:

`cp .envrctemplate .envrc`

## Configuration(optional)

We recommend using ESLint and Prettier for linting/formatting. If you are using VSCode, they can be downloaded directly through the Extensions panel. Run ESLint on the codebase with `npm run lint` and Prettier with  `npm run format`.


### Tools

We also have a collection of tools in the `utils` folder.

These include `createDummyData.ts` which populates the MongoDB table with some dummy data to run queries on and `rss-feed.ts` which combines the feeds from the publications listed in `publications.json`. Both scripts can be run with `ts-node <file>.ts`. 
