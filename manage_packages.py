#!/usr/bin/env python3
"""
Package Manager Script
======================
Install or uninstall Python packages from the terminal.
Includes all packages needed for:
  predicting_photometric_redshift_failures_using_machine_learning...

Usage:
    python3 manage_packages.py install
    python3 manage_packages.py uninstall
    python3 manage_packages.py install numpy pandas        # specific packages
    python3 manage_packages.py uninstall numpy pandas      # specific packages
    python3 manage_packages.py status                      # check what's installed
"""

import subprocess
import sys
import importlib.util

# ── All packages required by the redshift ML script ──────────────────────────
REQUIRED_PACKAGES = {
    "pandas":                 "pandas",
    "numpy":                  "numpy",
    "scikit-learn":           "sklearn",
    "tensorflow":             "tensorflow",
    "tensorflow-probability": "tensorflow_probability",
    "matplotlib":             "matplotlib",
    "seaborn":                "seaborn",
    "scipy":                  "scipy",
}
# Key   → pip install name
# Value → import name (used for status check)


def run(cmd: list[str]) -> int:
    """Run a shell command and stream output live."""
    print(f"\n▶  {' '.join(cmd)}\n" + "─" * 50)
    result = subprocess.run(cmd)
    return result.returncode


def install(packages: dict[str, str]) -> None:
    pip_names = list(packages.keys())
    print(f"\n📦  Installing {len(pip_names)} package(s)…")
    code = run([sys.executable, "-m", "pip", "install", "--upgrade"] + pip_names)
    if code == 0:
        print("\n✅  All packages installed successfully.")
    else:
        print("\n❌  Some packages failed to install. Check the output above.")


def uninstall(packages: dict[str, str]) -> None:
    pip_names = list(packages.keys())
    confirm = input(f"\n⚠️   About to UNINSTALL: {', '.join(pip_names)}\n    Continue? [y/N] ").strip().lower()
    if confirm != "y":
        print("Aborted.")
        return
    code = run([sys.executable, "-m", "pip", "uninstall", "-y"] + pip_names)
    if code == 0:
        print("\n✅  Packages uninstalled.")
    else:
        print("\n❌  Some packages could not be uninstalled.")


def status(packages: dict[str, str]) -> None:
    print(f"\n{'Package':<25} {'Import name':<25} {'Status'}")
    print("─" * 65)
    for pip_name, import_name in packages.items():
        found = importlib.util.find_spec(import_name) is not None
        icon  = "✅  installed" if found else "❌  NOT installed"
        print(f"{pip_name:<25} {import_name:<25} {icon}")


def resolve(names: list[str]) -> dict[str, str]:
    """Filter REQUIRED_PACKAGES to only the names given on the CLI."""
    result = {}
    for n in names:
        if n in REQUIRED_PACKAGES:
            result[n] = REQUIRED_PACKAGES[n]
        else:
            # Treat unknown name as both pip name and import name
            result[n] = n.replace("-", "_")
    return result


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    args = sys.argv[1:]

    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        sys.exit(0)

    action   = args[0].lower()
    extra    = args[1:]                                   # optional package list
    packages = resolve(extra) if extra else REQUIRED_PACKAGES

    if action == "install":
        install(packages)
    elif action == "uninstall":
        uninstall(packages)
    elif action == "status":
        status(packages)
    else:
        print(f"Unknown action '{action}'. Use: install | uninstall | status")
        sys.exit(1)
