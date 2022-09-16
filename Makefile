CONFIG_DIR = $(shell pwd)/config
BACKUPS_DIR = $(shell pwd)/backups
PYTHON = $(shell pwd)/python-ve/bin/python
PIP = $(shell pwd)/python-ve/bin/pip
RML2PDF = $(shell pwd)/python-ve/bin/rml2pdf
NODE_DEB_URL = https://deb.nodesource.com/setup_8.x
LABEL_CONFIG_DIR = $(shell pwd)/label-printer/config

##> all : Build all components
all: config server labels scripts client

##> help : Show this help text
.PHONY: help
help:
	@python scripts/makefile_self_document.py

python-ve: scripts/requirements.txt
	python3 -m venv python-ve
	python-ve/bin/pip install -r scripts/requirements.txt

/usr/bin/node:
	curl -sL $(NODE_DEB_URL) | sudo -E bash -
	sudo apt-get install -y nodejs
	sudo npm install npm --global

config: config/prod.json

config/prod.js: config/template.js.in
	cp config/template.js.in config/prod.js

##> ubuntu-env : Installs all necessary Ubuntu packages.
.PHONY: ubuntu-env
ubuntu-env: /usr/bin/node
	sudo apt-get install \
	    mysql-server \
	    virtualenv \
	    python-dev \
	    curl

##> database : Creates and initializes the database.
.PHONY: database
database:
	cat sql/bootstrap.sql | mysql -p -u root
	cat sql/schema.sql | mysql -u gssb --password=gssblib spils

##> clean : Cleans the build from any generated files.
clean:
	rm -rf python-ve
	rm -rf client/dist
	rm -rf client/dist-public
	rm -rf client/node_modules

##> clean : Remove all untracked files. Be careful using this!
real-clean:
	git clean -d -x -f

####> Library Application Server <#############################################

server/node_modules: server/package.json
	cd server; \
	npm install

##> server : Install/build the node server.
server: config/prod.js | server/node_modules

##> test-server : Run server tests.
.PHONY: test-server
test-server:
	cd server; \
	npm test

##> run-server : Run server on standard port.
.PHONY: run-server
run-server: server
	cd server; \
	NODE_CONFIG_DIR=$(CONFIG_DIR) NODE_ENV=prod npm run start-dev

##> sync-antolin : Process the latest Antolin database in the CLI.
.PHONY: sync-antolin
sync-antolin: server
	cd server; \
	NODE_CONFIG_DIR=$(CONFIG_DIR) NODE_ENV=prod npm run sync-antolin


####> Client <#################################################################

##> client : Install client components.
client: client/package.json
	cd client; \
	sudo npm install -g @angular/cli; \
	npm install

##> client-dist : Build volunteer client distribution
client-dist:
	cd client; \
	ng build --prod --base-href "/"

##> client-dev : Start the volunteer client dev server on port 4200.
client-dev:
	cd client; \
	ng serve --proxy-config proxy.conf.json

##> public-client-dist : Build public client distribution
public-client-dist:
	cd client; \
	ng build public --prod --base-href "/public/"

##> public-client-dev : Start the public client dev server on port 5200.
public-client-dev:
	cd client; \
	ng serve public --proxy-config proxy.conf.json --port 5200


####> Label Printer Server <###################################################

##> labels : Install/build the label printer server/cli environment.
labels: python-ve
	$(PIP) install -r labels/requirements.txt

label-printer/build/index.js: src/**/*.ts
	cd label-printer; \
	npx tsc

##> run-labels-server : Run labels printer server.
run-label-printer:
	cd label-printer; \
	NODE_CONFIG_DIR=$(LABEL_CONFIG_DIR) NODE_ENV=prod \
	node build/index.js

##> run-labels-server : Run labels printer server.
run-label-printer-dev:
	cd label-printer; \
	NODE_CONFIG_DIR=$(LABEL_CONFIG_DIR) NODE_ENV=prod \
	./node_modules/ts-node-dev/lib/bin.js --respawn --transpile-only src/index.ts


####> Scripts <###############################################################

##> scripts : Install/build the scripts environment.
scripts: scripts/requirements.txt | python-ve
	$(PIP) install -r scripts/requirements.txt

ALL_TEMPLATES := $(shell find ./config/label-templates -name '*.rml')
ALL_TEMPLATE_PDFS := $(ALL_TEMPLATES:%.rml=%.pdf)

config/label-templates/%.pdf: config/label-templates/%.rml
	$(RML2PDF) $< $@

##> label-templates : Compile all label templates.
label-templates: $(ALL_TEMPLATE_PDFS)

####> Database <#############################################

##> restore FILE=<path>: Load the specified backup file into database.
.PHONY: restore
restore:
	zcat $(FILE) | mysql spils

##> open-db: Opens the database.
open-db:
	mysql spils

cloud_sql_proxy:
	wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy
	chmod +x cloud_sql_proxy

##> run-sql-proxy: Start SQL Proxy for master database.
.PHONY: restore
run-sql-proxy: cloud_sql_proxy
	./cloud_sql_proxy \
	    -instances=gssb-library-c7c5e:us-central1:spils=tcp:3307 \
	    -credential_file=./gssb-library-c7c5e-dd579be31370.json
