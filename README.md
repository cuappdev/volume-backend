# volume-backend  

An open-sourced backend for Volume, a news aggregator for Cornell's publications
and magazines. Made by [Cornell AppDev](cornellappdev.com). 

Tech stack:
1. Typescript/Node.js
2. MongoDB
3. GraphQL

## Installation  

To run this project, you must have Node.js [See installation guide](https://nodejs.org/en/download/) and Typescript [See installation guide](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) installed on your machine. 

Clone the project with

`git clone https://github.com/cuappdev/volume-backend.git`

After cloning the proejct `cd` into the new directory and install dependencides with 

`npm install`

To run the project, use

`npm run start`

## Setting up the database: 

Make sure `MongoDB` is installed. [See installation guide].(https://docs.mongodb.com/manual/installation/

To view your database, enter your terminal and run 

`mongo`

From here, you can interact with your database, type `use <db_name>`.

If you are using VSCode, we recommend installing the MongoDB extension to allow you to interact with documents in your database straight through the editor. More information on this [here](https://code.visualstudio.com/docs/azure/mongodb).

## Environment variables

We recommend using [`dotenv`](https://www.npmjs.com/package/dotenv). To set up, simply add a `.env` file to your source directory and add the following environment variables.

`NODE_ENV`  
`SERVER_ADDRESS`  
`MONGO_ADDRESS`  
`APP_PORT`


## Configuration(optional)

We recommend using ESLint and Prettier for linting/formatting. If you are using VSCode, they can be downloaded directly through the Extensions panel. Run ESLint on the codebase with npm run lint and Prettier with npm run format.
  

