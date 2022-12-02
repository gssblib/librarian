import {app} from "./server";
import {onRequest} from "firebase-functions/v2/https";
import {setGlobalOptions} from "firebase-functions/v2";

setGlobalOptions({ timeoutSeconds: 5*60 });

exports.api = onRequest(app);
