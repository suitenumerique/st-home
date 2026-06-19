"""Queue the website and DNS checks for every organization.

Run with: python -m tasks.queue_all
"""

from .check_dns import queue_all as queue_all_dns
from .check_website import queue_all as queue_all_website


def main():
    queue_all_website()
    queue_all_dns()


if __name__ == "__main__":
    main()
