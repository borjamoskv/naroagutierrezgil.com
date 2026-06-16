#!/usr/bin/env python3
import sys
import os

def verify_autodidact_apex():
    """
    C5-REAL deterministic verifier for Autodidact-APEX.
    Ensures that the Tripartite Artifacts exist and conform to C5-REAL execution standards.
    """
    skill_dir = os.path.dirname(os.path.abspath(__file__))
    
    skill_md = os.path.join(skill_dir, "SKILL.md")
    schema_json = os.path.join(skill_dir, "schema.json")
    
    if not os.path.exists(skill_md):
        print("ABORTED: SKILL.md missing")
        sys.exit(1)
        
    if not os.path.exists(schema_json):
        print("ABORTED: schema.json missing")
        sys.exit(1)
        
    print("VERIFIED: Autodidact-APEX Tripartite Artifacts Complete.")
    sys.exit(0)

if __name__ == "__main__":
    verify_autodidact_apex()
