# GSSB Library Label Printer Provisioning

## Fast Way: Bootstrap

```
wget -L https://raw.githubusercontent.com/gssblib/firebase/master/label-printer/provision/bootstrap.py -O bootstrap-label-printer.py
python bootstrap-label-printer.py
```

## Manual Way

### Clone the repository

```
git clone https://github.com/gssblib/firebase.git
```

### Bootstrap Salt

```
wget -L https://bootstrap.saltproject.io -o bootstrap_salt.sh
sudo sh bootstrap_salt.sh
```

### Setup Grains

Create the file `<library-printer-path>/provision/grains` and add the following contents:

```
app_dir: <app-path>
api.url: <api-user DEFAULT: "https://librarian.gssb.org/api">
api.username: <api-user DEFAULT: "printer">
api.password: <api-password>
```

## Apply Salt State

```
cd <app-path>/label-printer/provision
sudo salt-call -c . --local state.apply
```

## Debug Output

```
sudo salt-call -c . --local -l debug ...
```
