import config from 'config';
import cookieParser from 'cookie-parser';
import express from 'express';
import {ExpressApp} from './common/express_app';
import * as library from './domain/library';
import * as login from './domain/login';

const serverConfig: {port: number} = config.get('server');
const port = serverConfig.port;

console.log(`Starting library server on port ${port}`);
const app: express.Application = express();
const authConfig: {cookie: string} = config.get('auth');

app.use(express.json());
app.use(cookieParser(authConfig.cookie));

const application = new ExpressApp(app);
login.initRoutes(app);
library.initRoutes(application);

function errorHander(
    err: any, _: express.Request, res: express.Response,
    next: express.NextFunction) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token\n');
  } else {
    next(err);
  }
}

app.use(errorHander);

app.listen(port, () => {
  console.log(`The application is listening on port ${port}!`);
});
