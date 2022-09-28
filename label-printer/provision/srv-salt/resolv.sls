
/etc/resolvconf.conf:
  file.managed:
    - name: /etc/resolvconf.conf
    - source: salt://resolvconf.conf
    - mode: 0644
