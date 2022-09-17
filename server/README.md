# GSSB library server using firebase, express, ts-node, and mysql2

## Firebase

To transpile TypeScript run `npm run build`. After this you can run
`firebase emulators:start`.

Set `NODE_ENV` to pick up the configuration. For example set it to
`sqlproxy`. For For Firebase this is configured in `.env.local`.

To deploy use `firebase deploy`.

## Directly

To start the server with nodemon (automatically restarting the server
when a source file changes), call `npm run start-server-dev` which in
turn will call `npm nodemon src/main.ts`.

To start without nodemon, call `npm run start-server`, which in turn
will call `npx ts-node src/main.ts`.

Set `NODE_CONFIG` or `NODE_CONFIG_DIR` and `NODE_ENV` to pick up the
configuration.
