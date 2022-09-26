# GSSB Library App

This project contains the web app for the library of the GSSB.

The application consists of an AngularJS client talking to a node.js server
backed by a mysql database (using the schema of the previous version of the
library application which was based on MS WebMatrix).


## Directory Structure

- client: client web application (angular 5+)
- functions: node.js server
- label-printer: A label printe
- scripts: A directory with operational scripts
- sql: SQL schema and migration scripts for the DB
- config: contains the config for the server and tools
- doc: project documentation


## Basic Setup

All commands needed to build and run the application are maintained in a
Makefile. You can see the list of available commands using `make help`.

```
$ make
$ cp config/template.json.in config/prod.json
$ editor config/prod.json
$ make server-run
$ make client-dev
```

You can now access the application via `http://localhost:4200`.

Note: All `make` targets can be accessed using

```
$ make help
```

### More Documentation

- [API](doc/api.md)
- [Install](doc/install.md)
- [Use-Cases](doc/use-cases.md)
