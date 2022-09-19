{% set app_dir = salt['grains.get']('app_dir') %}
{% set server_dir = app_dir + '/label-printer' %}

include:
  - node

label printer install:
  cmd.run:
    - name: |
        npm install && \
        md5sum package.json > .md5sums
    - cwd: {{ server_dir }}
    - runas: gssb
    - require:
      - npm
    - unless: |
        test -e node_modules && \
        test -e .md5sums && md5sum --strict --status -c .md5sums

label printer config:
  file.managed:
    - name: {{ app_dir }}/label-printer/config/prod.json
    - source: salt://prod-config.json
    - user: gssb
    - template: jinja
    - mode: 0644
    - context:
      root_path: {{ app_dir }}/label-printer
