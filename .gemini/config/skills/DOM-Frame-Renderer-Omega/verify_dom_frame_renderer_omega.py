import sys
import os

def verify():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if not os.path.exists(os.path.join(base_dir, 'SKILL.md')): return 1
    if not os.path.exists(os.path.join(base_dir, 'schema.json')): return 1
    if not os.path.exists(os.path.join(base_dir, 'policy.yaml')): return 1
    return 0

if __name__ == "__main__":
    sys.exit(verify())
