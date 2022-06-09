import {app} from './server';
import {onRequest} from 'firebase-functions/v2/https';

exports.api = onRequest(app);
