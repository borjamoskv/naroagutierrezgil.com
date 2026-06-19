import yaml
from classifier import classify_file
from router import route_file
import os

class RulesEngine:
    def __init__(self, rules_path):
        with open(rules_path, 'r') as f:
            self.config = yaml.safe_load(f)
        self.rules = self.config.get('rules', [])
        self.routing = self.config.get('routing', {})
        self.feedback = self.config.get('feedback', {})

    def evaluate(self, filepath):
        for rule in self.rules:
            match = rule.get('match', {})
            if 'path_contains' in match and match['path_contains'] in filepath:
                self.execute_actions(rule.get('actions', []), filepath)
                break

    def execute_actions(self, actions, filepath):
        file_type = "unknown"
        if "classify" in actions:
            file_type = classify_file(filepath)
        
        if "route_by_type" in actions:
            dest_folder = self.routing.get(file_type, self.routing.get("unknown", "00_QUARANTINE"))
            
            # TODO: Integrate with actual vaults dynamically
            base_dir = os.path.expanduser("~/Documents") 
            target_dir = os.path.join(base_dir, dest_folder)
            
            route_file(filepath, target_dir, self.feedback)
