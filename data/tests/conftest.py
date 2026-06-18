import os
import sys

# Use the in-memory StubBroker in tests. Declaring an actor calls declare_queue,
# which on the real Redis Streams broker eagerly creates consumer groups (and so
# needs a running Redis). The stub keeps imports cheap and offline. Must be set
# before any task module (and thus `broker`) is imported.
os.environ.setdefault("WORKER_TESTING", "1")

# Set PYTHONPATH to the project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
