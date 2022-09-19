{% set home_dir = salt['user.info']('gssb').home %}

{{ home_dir }}/.config/autostart:
  file.directory:
    - user: gssb
    - group: gssb
    - dir_mode: 775
    - makedirs: True
    - recurse:
      - user
      - group
      - mode

autostart:
  file.managed:
    - name: {{ home_dir }}/.config/autostart/label-printer.desktop
    - source: salt://label-printer.desktop
    - cwd: {{ home_dir }}
    - user: gssb
    - template: jinja
    - mode: 0644
