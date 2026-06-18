#!/usr/bin/env python3
# C5-REAL
# SOCIAL-ALG-REVENG-OMEGA v1.0.0

import sys
import json
import math
import argparse
from typing import Dict, Any, List

class XAlgorithmModel:
    """
    Simulates the open-source X (Twitter) Recommendation Algorithm ranking weights.
    Based on open-source releases and empirical reverse-engineering parameters.
    """
    def __init__(self):
        # Base multipliers for heavy ranker
        self.weights = {
            "like": 30.0,
            "retweet": 20.0,
            "reply": 27.0,
            "bookmark": 150.0,
            "profile_visit_and_follow": 370.0,
            "video_watch_50": 350.0,
            "link_click": -15.0,        # External links penalized without native media/engagement
            "report": -369.0,
            "mute": -270.0,
            "block": -370.0,
            "unfollow": -180.0,
            "negative_feedback": -50.0
        }
        
    def calculate_score(self, metrics: Dict[str, float], author_tier: str = "standard") -> Dict[str, Any]:
        score = 0.0
        details = {}
        
        # Calculate positive components
        for key, weight in self.weights.items():
            count = metrics.get(key, 0.0)
            contrib = count * weight
            score += contrib
            details[key] = contrib
            
        # Time decay modeling: half-life of 360 minutes (6 hours)
        age_minutes = metrics.get("age_minutes", 0.0)
        decay_factor = math.pow(0.5, age_minutes / 360.0)
        
        # Creator multiplier
        creator_mult = 1.0
        if author_tier == "premium":
            creator_mult = 4.0
        elif author_tier == "premium_plus":
            creator_mult = 8.0
        elif author_tier == "government_news":
            creator_mult = 3.0
            
        raw_score = score
        score_decayed = raw_score * decay_factor * creator_mult
        
        return {
            "raw_score": raw_score,
            "decay_factor": decay_factor,
            "creator_multiplier": creator_mult,
            "final_score": max(0.0, score_decayed),
            "breakdown": details
        }

class TikTokAlgorithmModel:
    """
    Simulates TikTok's recommendation loop emphasizing watch time, completion, and loops.
    """
    def calculate_score(self, metrics: Dict[str, float]) -> Dict[str, Any]:
        # Watch time / Duration metrics
        duration = max(1.0, metrics.get("duration_seconds", 15.0))
        watch_time = metrics.get("avg_watch_time_seconds", 0.0)
        
        # Completion Rate (CR)
        cr = min(2.0, watch_time / duration) # can exceed 1.0 due to loops
        
        # Base completion boost
        completion_multiplier = 1.0
        if cr >= 1.0:
            completion_multiplier = 4.5 * math.pow(cr, 2.0)
        elif cr >= 0.8:
            completion_multiplier = 2.0 * cr
        else:
            completion_multiplier = 0.5 * cr
            
        # Social interactions
        likes = metrics.get("likes", 0.0)
        comments = metrics.get("comments", 0.0)
        shares = metrics.get("shares", 0.0)
        downloads = metrics.get("downloads", 0.0)
        
        interaction_score = (likes * 2.0) + (comments * 10.0) + (shares * 24.0) + (downloads * 30.0)
        
        # Total combined score
        final_score = (interaction_score + 10.0) * completion_multiplier
        
        # Age decay: very aggressive for TikTok
        age_hours = metrics.get("age_hours", 0.0)
        decay_factor = math.pow(0.5, age_hours / 18.0) # 18h half-life
        
        return {
            "completion_rate": cr,
            "completion_multiplier": completion_multiplier,
            "interaction_score": interaction_score,
            "decay_factor": decay_factor,
            "final_score": final_score * decay_factor
        }

class SubstackNotesModel:
    """
    Simulates ranking mechanics in Substack Notes feeds.
    Notes prioritize subscriber relationships and thread depth.
    """
    def calculate_score(self, metrics: Dict[str, float], relationships: Dict[str, Any]) -> Dict[str, Any]:
        # Engagement counts
        likes = metrics.get("likes", 0.0)
        restacks = metrics.get("restacks", 0.0)
        replies = metrics.get("replies", 0.0)
        thread_depth = metrics.get("thread_depth", 0.0)
        
        # Base engagement weights
        engagement_score = (likes * 10.0) + (restacks * 50.0) + (replies * 35.0)
        
        # Thread depth multiplier (rewards engaging discussions)
        # Deep discussions receive a multiplicative boost
        thread_multiplier = 1.0 + (thread_depth * 0.15)
        
        # Relationship multipliers
        is_subscribed = relationships.get("is_subscribed_to_author", False)
        is_paid = relationships.get("is_paid_subscriber", False)
        
        relationship_multiplier = 1.0
        if is_subscribed:
            relationship_multiplier = 3.0
            if is_paid:
                relationship_multiplier = 10.0 # Heavy priority to paid publications/creators
                
        # Time decay: moderate
        age_hours = metrics.get("age_hours", 0.0)
        decay_factor = math.pow(0.5, age_hours / 48.0) # 48h half life (slower decay)
        
        final_score = engagement_score * thread_multiplier * relationship_multiplier * decay_factor
        
        return {
            "engagement_score": engagement_score,
            "thread_multiplier": thread_multiplier,
            "relationship_multiplier": relationship_multiplier,
            "decay_factor": decay_factor,
            "final_score": final_score
        }

def run_diagnostics(args):
    """
    Runs diagnostic and optimization simulations based on inputs.
    """
    x_model = XAlgorithmModel()
    tiktok_model = TikTokAlgorithmModel()
    substack_model = SubstackNotesModel()
    
    if args.platform == "x":
        metrics = {
            "like": args.likes,
            "retweet": args.shares,
            "reply": args.comments,
            "bookmark": args.bookmarks,
            "profile_visit_and_follow": args.follows,
            "video_watch_50": args.video_views,
            "link_click": args.link_clicks,
            "age_minutes": args.age_minutes
        }
        res = x_model.calculate_score(metrics, author_tier=args.tier)
        print(json.dumps(res, indent=2))
        
    elif args.platform == "tiktok":
        metrics = {
            "duration_seconds": args.duration,
            "avg_watch_time_seconds": args.watch_time,
            "likes": args.likes,
            "comments": args.comments,
            "shares": args.shares,
            "downloads": args.bookmarks, # map downloads to bookmarks in CLI arg
            "age_hours": args.age_minutes / 60.0
        }
        res = tiktok_model.calculate_score(metrics)
        print(json.dumps(res, indent=2))
        
    elif args.platform == "substack":
        metrics = {
            "likes": args.likes,
            "restacks": args.shares,
            "replies": args.comments,
            "thread_depth": args.thread_depth,
            "age_hours": args.age_minutes / 60.0
        }
        relationships = {
            "is_subscribed_to_author": args.subscribed,
            "is_paid_subscriber": args.paid
        }
        res = substack_model.calculate_score(metrics, relationships)
        print(json.dumps(res, indent=2))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SOCIAL-ALG-REVENG-OMEGA Execution Kernel")
    parser.add_argument("--platform", type=str, required=True, choices=["x", "tiktok", "substack"])
    parser.add_argument("--likes", type=float, default=0.0)
    parser.add_argument("--shares", type=float, default=0.0)
    parser.add_argument("--comments", type=float, default=0.0)
    parser.add_argument("--bookmarks", type=float, default=0.0)
    parser.add_argument("--follows", type=float, default=0.0)
    parser.add_argument("--video_views", type=float, default=0.0)
    parser.add_argument("--link_clicks", type=float, default=0.0)
    parser.add_argument("--age_minutes", type=float, default=0.0)
    
    # Platform specific arguments
    parser.add_argument("--tier", type=str, default="standard")
    parser.add_argument("--duration", type=float, default=15.0)
    parser.add_argument("--watch_time", type=float, default=0.0)
    parser.add_argument("--thread_depth", type=float, default=0.0)
    parser.add_argument("--subscribed", action="store_true")
    parser.add_argument("--paid", action="store_true")
    
    args = parser.parse_args()
    run_diagnostics(args)
