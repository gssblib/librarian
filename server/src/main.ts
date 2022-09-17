import config from "config";
import {app} from "./server";

const serverConfig: {port: number} = config.get("server");
const port = process.env.PORT || serverConfig.port || 3000;

app.listen(port, () => {
  console.log(`The application is listening on port ${port}!`);
});
