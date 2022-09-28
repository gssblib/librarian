unattended-upgrades:
  pkg.installed:
    - pkgs:
      - unattended-upgrades
    - refresh: false

unattended-upgrades-config:
  file.managed:
    - name: /etc/apt/apt.conf.d/51unattended-upgrades-raspbian
    - source: salt://51unattended-upgrades-raspbian
    - mode: 0644
