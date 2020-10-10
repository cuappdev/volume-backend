import { Request } from 'express';
import ApplicationRouter from '../utils/ApplicationRouter';

class HelloRouter extends ApplicationRouter<string> {
    constructor() {
        super('GET');
    }

    getPath(): string {
        return '/';
    }

    async content(req: Request): Promise<string> {
        return 'Hello world!';
    }
}

export default new HelloRouter().router;
