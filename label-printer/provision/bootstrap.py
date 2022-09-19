import os
import subprocess
import sys

APP_ROOT = "/opt/gssb2"
REPO = "firebase"
GITHUB_URL = f"https://github.com/gssblib/{REPO}.git"
SALT_BOOTSTRAP_URL = "https://bootstrap.saltproject.io"

DEFAULT_API_URL = 'https://librarian.gssb.org/api'
DEFAULT_API_USERNAME = 'printer'

grains = {}


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
    grains["app_dir"] = app_dir = os.path.join(APP_ROOT, REPO)
    if not os.path.exists(app_dir):
        cmd(["git", "clone", GITHUB_URL, app_dir])
    else:
        cmd(["git", "-C", app_dir, "pull", "-r"])


def collect_api_info():
    grains['api.url'] = input(f'API URL [${DEFAULT_API_URL}]: ')
    if not grains['api.url']:
        grains['api.url'] = DEFAULT_API_URL
    grains['api.username'] = input(f'API Username [${DEFAULT_API_USERNAME}]: ')
    if not grains['api.username']:
        grains['api.username'] = DEFAULT_API_USERNAME
    grains['api.password'] = input(f'API Password: ')


def write_grains():
    grains_path = os.path.join(
        grains["app_dir"], "label-printer", "provision", "grains"
    )
    print("Updating grains in %s" % grains_path)
    installed_grains = {}
    if os.path.exists(grains_path):
        with open(grains_path, "r") as io:
            installed_grains = dict(
                [line.strip().split(": ", 1) for line in io.readlines()]
            )
    installed_grains.update(grains)
    with open(f"{grains_path}.tmp", "w") as io:
        io.write(
            "\n".join(
                "%s: %s" % (key, value) for key, value in installed_grains.items()
            )
        )
    cmd(["sudo", "mv", grains_path + ".tmp", grains_path])


def run_salt():
    print("Applying salt state.")
    cmd(
        [
            "sudo",
            "salt-call",
            "-c",
            f"{grains['app_dir']}/label-printer/provision", "--local",
            "state.apply",
        ]
    )


def main():
    install_packages()
    install_salt()
    clone_repos()
    collect_api_info()
    write_grains()
    run_salt()


if __name__ == "__main__":
    main()
