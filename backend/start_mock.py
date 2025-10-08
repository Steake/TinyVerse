"""Deprecated TinyTroupe mock starter.

This helper used to patch TinyTroupe dependencies to run the backend without
real LLM connectivity. Mock mode has been removed; keep this file as a guard so
legacy scripts fail with a clear error rather than silently spinning up a fake
environment.
"""

import sys


def main() -> int:
    print(
        "❌ TinyVerse no longer ships a TinyTroupe mock backend. "
        "Configure your API credentials and run start.sh to launch the real system.",
        file=sys.stderr,
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
