import dotenv from 'dotenv';
import API from './API';

// load the environment variables from the .env file
dotenv.config({
    path: '.env',
});

// initialize server app
const app = new API();
const server = app.getServer(false);

// make server listen on some port
((port = process.env.APP_PORT || 5000, server_address = '0.0.0.0') => {
    app.express.listen(port, () => console.log(`App is running on ${server_address}:${port}`));
    console.log('PRESS CTRL-C to stop\n');
})();

export { server };
