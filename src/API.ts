import ApplicationAPI, { APISchema, ExpressCallback } from './utils/ApplicationAPI';
import bodyParser from 'body-parser';
import HelloRouter from './routers/HelloRouter';
import DocsRouter from './routers/DocsRouter';

class API extends ApplicationAPI {
    getPath(): string {
        return '/api/';
    }

    middleware(): ExpressCallback[] {
        // tslint:disable-next-line: deprecation
        return [bodyParser.json()];
    }

    versions(): { [index: string]: APISchema } {
        return { v1: this.routerGroups() };
    }

    routerGroups(): APISchema {
        return {
            docs: [DocsRouter],
            general: [HelloRouter],
        };
    }
}

export default API;
