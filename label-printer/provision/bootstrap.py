import os
import subprocess
import sys

APP_ROOT = "/opt/gssb"
APP_DIR = f"{APP_ROOT}/librarian"
GRAINS_PATH = os.path.join(APP_DIR, "label-printer", "provision", "grains")

GITHUB_URL = f"https://github.com/gssblib/firebase.git"
SALT_BOOTSTRAP_URL = "https://bootstrap.saltproject.io"

DEFAULT_API_URL = "https://librarian.gssb.org/api"
DEFAULT_API_USERNAME = "printer"

grains = {
    "app_dir": APP_DIR,
}


def cmd(cmd):
    print("  CMD: " + " ".join(cmd))
    subprocess.call(cmd)


def install_packages():
    print("Installing bootstrap Ubuntu packages...")
    cmd(["sudo", "apt-get", "install", "git"])


def install_salt():
    if os.path.exists("/usr/bin/salt-minion"):
        return
    print("Installing Saltstack. That may take a while...")
    if not os.path.exists("bootstrap-salt.sh"):
        cmd(["wget", SALT_BOOTSTRAP_URL, "-O", "bootstrap-salt.sh"])
    cmd(["sudo", "sh", "bootstrap-salt.sh"])


def clone_repos():
    # Create installation root.
    if not os.path.exists(APP_ROOT):
        cmd(["sudo", "mkdir", "-p", APP_ROOT])
        cmd(["sudo", "chown", "%s:%s" % (os.getlogin(), os.getgroups()[0]), APP_ROOT])
    if not os.path.exists(APP_DIR):
        cmd(["git", "clone", GITHUB_URL, APP_DIR])
    else:
        cmd(["git", "-C", APP_DIR, "pull", "-r"])


def collect_api_info():
    # Do not ask for this info all the time.
    if os.path.exists(GRAINS_PATH):
        return
    grains["api.url"] = input(f"API URL [{DEFAULT_API_URL}]: ")
    if not grains["api.url"]:
        grains["api.url"] = DEFAULT_API_URL
    grains["api.username"] = input(f"API Username [{DEFAULT_API_USERNAME}]: ")
    if not grains["api.username"]:
        grains["api.username"] = DEFAULT_API_USERNAME
    grains["api.password"] = input(f"API Password: ")


def write_grains():
    print("Updating grains in %s" % GRAINS_PATH)
    installed_grains = {}
    if os.path.exists(GRAINS_PATH):
        with open(GRAINS_PATH, "r") as io:
            installed_grains = dict(
                [line.strip().split(": ", 1) for line in io.readlines()]
            )
    installed_grains.update(grains)
    with open(f"{GRAINS_PATH}.tmp", "w") as io:
        io.write(
            "\n".join(
                "%s: %s" % (key, value) for key, value in installed_grains.items()
            )
        )
    cmd(["sudo", "mv", GRAINS_PATH + ".tmp", GRAINS_PATH])


def run_salt():
    print("Applying salt state.")
    os.chdir(f"{grains['app_dir']}/label-printer/provision")
    cmd(["sudo", "salt-call", "-c", ".", "--local", "state.apply", "-l", "info"])


def main():
    install_packages()
    install_salt()
    clone_repos()
    collect_api_info()
    write_grains()
    run_salt()


if __name__ == "__main__":
    main()
