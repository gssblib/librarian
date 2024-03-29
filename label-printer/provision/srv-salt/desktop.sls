{% set home_dir = salt['user.info']('gssb').home %}

xterm:
  pkg.installed:
    - pkgs:
      - xterm

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

desktop-icon:
  file.managed:
    - name: /usr/share/pixmaps/gssb.png
    - source: salt://gssb.png
    - user: gssb
    - template: jinja
    - mode: 0750
    - require:
      - {{ home_dir }}/.config/autostart

desktop:
  file.managed:
    - name: {{ home_dir }}/Desktop/label-printer.desktop
    - source: salt://label-printer.desktop
    - user: gssb
    - template: jinja
    - mode: 0750
    - require:
      - desktop-icon

autostart:
  file.symlink:
    - name: {{ home_dir }}/.config/autostart/label-printer.desktop
    - target: {{ home_dir }}/Desktop/label-printer.desktop
    - require:
      - {{ home_dir }}/.config/autostart
      - desktop
