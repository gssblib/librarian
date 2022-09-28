standard printer drivers:
  pkg.installed:
    - pkgs:
      - printer-driver-dymo
    - refresh: false

pt9500-pc driver:
  pkg.installed:
    - name: pt9500pc
    - enable: True
    - sources:
      - pt9500pc: salt:///pt9500pccupswrapper-1.0.1-1.i386.deb
