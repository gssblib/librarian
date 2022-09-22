import config from 'config';

type DBConfigOptions = {[key: string]: string|number};

const FIELDS_TO_ARGS: {[key: string]: string|null} = {
  "host": "--host",
  "port": "--port",
  "socketPath": "--socket",
  "user": "--user",
  "password": "--password",
  "database": null,  // Positional argument.
}


function main() {
  let dbconf = config.get("db") as DBConfigOptions;
  let args = Object.entries(dbconf)
    .filter(([field, value]) => (FIELDS_TO_ARGS[field] !== undefined))
    .map(([field, value]) => {
      if (FIELDS_TO_ARGS[field] == null) {
        return value;
      }
      return `${FIELDS_TO_ARGS[field]}="${value}"`;
    });
  process.stdout.write(args.join(' '));
}

main();
