import json
import logging
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

logger = logging.getLogger("TerrainAnalyticsProcessor")

class TerrainAnalyticsProcessor:
    """
    Processes terrain detection history and vehicle state data from JSON.
    Generates advanced statistics, risk indices, decision alignments, and DataFrames for visualization.
    """
    
    def __init__(self, data: Optional[Dict[str, Any]] = None):
        self.session_id: str = ""
        self.vehicle_id: str = ""
        self.start_time: Optional[str] = None
        self.end_time: Optional[str] = None
        
        # Raw DataFrames
        self.frames_df = pd.DataFrame()
        self.detections_df = pd.DataFrame()
        self.commands_df = pd.DataFrame()
        
        # Summary statistics
        self.summary_metrics: Dict[str, Any] = {}
        
        if data is not None:
            self.load_data(data)

    def load_from_file(self, filepath: str) -> None:
        """Loads and processes detection data from a JSON file."""
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            self.load_data(data)
        except Exception as e:
            logger.error(f"Error loading terrain data from file: {e}")
            raise

    def load_data(self, data: Dict[str, Any]) -> None:
        """Parses the raw JSON data, performs validation, and constructs DataFrames."""
        if not isinstance(data, dict):
            raise ValueError("Input data must be a dictionary")

        self.session_id = data.get("session_id", "unknown_session")
        self.vehicle_id = data.get("vehicle_id", "unknown_vehicle")
        self.start_time = data.get("start_time")
        self.end_time = data.get("end_time")
        
        frames = data.get("frames", [])
        if not isinstance(frames, list):
            frames = []
            logger.warning("No valid frames list found in input data")
        
        frames_list = []
        detections_list = []
        commands_list = []
        
        for idx, frame in enumerate(frames):
            if not isinstance(frame, dict):
                logger.warning(f"Frame at index {idx} is invalid; skipping")
                continue

            frame_id = frame.get("frame_id", idx + 1)
            timestamp = frame.get("timestamp", 0.0)
            drive_mode = frame.get("drive_mode", "Comfort")
            ride_height = frame.get("ride_height", "Normal")
            
            # 1. Frames Data
            frames_list.append({
                "frame_id": frame_id,
                "timestamp": timestamp,
                "drive_mode": drive_mode,
                "ride_height": ride_height
            })
            
            # 2. Detections Data
            detections = frame.get("detections", [])
            if isinstance(detections, list):
                for det in detections:
                    if isinstance(det, dict):
                        detections_list.append({
                            "frame_id": frame_id,
                            "timestamp": timestamp,
                            "terrain_type": det.get("terrain_type", "Unknown"),
                            "confidence": det.get("confidence", 0.0),
                            "severity": det.get("severity", 0.0),
                            "bbox": det.get("bbox", [])
                        })
                
            # 3. Commands Data
            commands = frame.get("vehicle_commands", [])
            if isinstance(commands, list):
                for cmd in commands:
                    if isinstance(cmd, dict):
                        cmd_text = cmd.get("command", "None")
                        if cmd_text != "None":
                            commands_list.append({
                                "frame_id": frame_id,
                                "timestamp": timestamp,
                                "command": cmd_text,
                                "status": cmd.get("status", "Executed")
                            })
        
        # Build DataFrames
        self.frames_df = pd.DataFrame(frames_list) if frames_list else pd.DataFrame(
            columns=["frame_id", "timestamp", "drive_mode", "ride_height"]
        )
        self.detections_df = pd.DataFrame(detections_list) if detections_list else pd.DataFrame(
            columns=["frame_id", "timestamp", "terrain_type", "confidence", "severity", "bbox"]
        )
        self.commands_df = pd.DataFrame(commands_list) if commands_list else pd.DataFrame(
            columns=["frame_id", "timestamp", "command", "status"]
        )
        
        # Compute all stats
        self._compute_summary_metrics()

    def _compute_summary_metrics(self) -> None:
        """Computes summary metrics for the dashboard cards."""
        if self.frames_df.empty:
            self.summary_metrics = {
                "total_frames": 0,
                "total_detections": 0,
                "avg_confidence": 0.0,
                "avg_severity": 0.0,
                "most_common_terrain": "N/A",
                "most_used_drive_mode": "N/A"
            }
            return
            
        total_frames = len(self.frames_df)
        total_detections = len(self.detections_df)
        
        avg_confidence = float(self.detections_df["confidence"].mean()) if not self.detections_df.empty else 0.0
        avg_severity = float(self.detections_df["severity"].mean()) if not self.detections_df.empty else 0.0
        
        if not self.detections_df.empty:
            most_common_terrain = str(self.detections_df["terrain_type"].mode()[0])
        else:
            most_common_terrain = "None"
            
        most_used_drive_mode = str(self.frames_df["drive_mode"].mode()[0]) if "drive_mode" in self.frames_df.columns else "N/A"
        
        self.summary_metrics = {
            "total_frames": total_frames,
            "total_detections": total_detections,
            "avg_confidence": round(avg_confidence, 3),
            "avg_severity": round(avg_severity, 3),
            "most_common_terrain": most_common_terrain,
            "most_used_drive_mode": most_used_drive_mode
        }

    def get_terrain_distribution(self) -> pd.DataFrame:
        """Returns the distribution of detected terrains (count and percentage)."""
        if self.detections_df.empty:
            return pd.DataFrame(columns=["terrain_type", "count", "percentage"])
        counts = self.detections_df["terrain_type"].value_counts()
        percentages = self.detections_df["terrain_type"].value_counts(normalize=True) * 100
        dist_df = pd.DataFrame({"count": counts, "percentage": percentages.round(2)})
        dist_df.index.name = "terrain_type"
        return dist_df.reset_index()

    def get_detection_frequency(self, bin_size_seconds: float = 1.0) -> pd.DataFrame:
        """Returns detection frequency aggregated by time intervals."""
        if self.detections_df.empty:
            return pd.DataFrame(columns=["time_bin", "detection_count"])
            
        max_time = self.detections_df["timestamp"].max()
        bins = np.arange(0, max_time + bin_size_seconds, bin_size_seconds)
        if len(bins) < 2:
            bins = np.array([0.0, bin_size_seconds])
            
        self.detections_df["time_bin"] = pd.cut(self.detections_df["timestamp"], bins=bins, labels=bins[:-1])
        freq = self.detections_df.groupby("time_bin", observed=False).size().reset_index(name="detection_count")
        freq["time_bin"] = freq["time_bin"].astype(float)
        return freq

    def get_confidence_stats(self) -> Dict[str, float]:
        """Returns statistical metrics for detection confidence."""
        if self.detections_df.empty:
            return {"mean": 0.0, "std": 0.0, "min": 0.0, "max": 0.0, "median": 0.0}
        desc = self.detections_df["confidence"].describe()
        return {
            "mean": round(float(desc["mean"]), 3),
            "std": round(float(desc["std"]), 3) if not pd.isna(desc["std"]) else 0.0,
            "min": round(float(desc["min"]), 3),
            "max": round(float(desc["max"]), 3),
            "median": round(float(self.detections_df["confidence"].median()), 3)
        }

    def get_severity_stats(self) -> Dict[str, float]:
        """Returns statistical metrics for terrain severity."""
        if self.detections_df.empty:
            return {"mean": 0.0, "std": 0.0, "min": 0.0, "max": 0.0, "median": 0.0}
        desc = self.detections_df["severity"].describe()
        return {
            "mean": round(float(desc["mean"]), 3),
            "std": round(float(desc["std"]), 3) if not pd.isna(desc["std"]) else 0.0,
            "min": round(float(desc["min"]), 3),
            "max": round(float(desc["max"]), 3),
            "median": round(float(self.detections_df["severity"].median()), 3)
        }

    def get_drive_mode_distribution(self) -> pd.DataFrame:
        """Returns the distribution of drive modes (count and percentage)."""
        if self.frames_df.empty:
            return pd.DataFrame(columns=["drive_mode", "count", "percentage"])
        counts = self.frames_df["drive_mode"].value_counts()
        percentages = self.frames_df["drive_mode"].value_counts(normalize=True) * 100
        dist_df = pd.DataFrame({"count": counts, "percentage": percentages.round(2)})
        dist_df.index.name = "drive_mode"
        return dist_df.reset_index()

    def get_ride_height_distribution(self) -> pd.DataFrame:
        """Returns the distribution of ride heights (count and percentage)."""
        if self.frames_df.empty:
            return pd.DataFrame(columns=["ride_height", "count", "percentage"])
        counts = self.frames_df["ride_height"].value_counts()
        percentages = self.frames_df["ride_height"].value_counts(normalize=True) * 100
        dist_df = pd.DataFrame({"count": counts, "percentage": percentages.round(2)})
        dist_df.index.name = "ride_height"
        return dist_df.reset_index()

    def get_command_statistics(self) -> pd.DataFrame:
        """Returns statistics on vehicle commands issued."""
        if self.commands_df.empty:
            return pd.DataFrame(columns=["command", "status", "count"])
        stats = self.commands_df.groupby(["command", "status"]).size().reset_index(name="count")
        return stats

    def get_timeline_data(self) -> pd.DataFrame:
        """Returns chronological data of detections and vehicle state changes."""
        if self.detections_df.empty:
            return pd.DataFrame()
            
        merged = pd.merge(
            self.detections_df, 
            self.frames_df[["frame_id", "drive_mode", "ride_height"]], 
            on="frame_id", 
            how="left"
        )
        return merged.sort_values(by="timestamp")

    # ==========================================
    # NEW ADVANCED ANALYTICS RESPONSIBILITIES
    # ==========================================

    def get_risk_analytics(self) -> Dict[str, Any]:
        """
        Computes safety-related risk metrics:
        - cumulative_risk: sum of risk scores
        - avg_risk_score: average risk score
        - high_risk_zones_count: count and timestamps where severity > 0.6
        - terrain_risk_index: risk per terrain type
        - high_risk_events: failed commands in rough terrains
        """
        if self.detections_df.empty:
            return {
                "cumulative_risk": 0.0,
                "avg_risk_score": 0.0,
                "high_risk_zones_count": 0,
                "terrain_risk_index": {},
                "high_risk_events": []
            }

        df = self.detections_df.copy()
        df["risk_score"] = df["confidence"] * df["severity"]

        cumulative_risk = float(df["risk_score"].sum())
        avg_risk_score = float(df["risk_score"].mean())

        high_risk_df = df[df["severity"] > 0.6]
        high_risk_zones_count = len(high_risk_df)

        terrain_risk = df.groupby("terrain_type")["risk_score"].mean().round(3).to_dict()

        high_risk_events = []
        if not self.commands_df.empty:
            failed_cmds = self.commands_df[self.commands_df["status"] == "Failed"]
            failed_with_det = pd.merge(failed_cmds, df, on="frame_id", how="inner")
            for _, row in failed_with_det[failed_with_det["severity"] > 0.5].iterrows():
                high_risk_events.append({
                    "timestamp": float(row["timestamp_x"]),
                    "command": str(row["command"]),
                    "terrain": str(row["terrain_type"]),
                    "severity": float(row["severity"])
                })

        return {
            "cumulative_risk": round(cumulative_risk, 3),
            "avg_risk_score": round(avg_risk_score, 3),
            "high_risk_zones_count": high_risk_zones_count,
            "terrain_risk_index": terrain_risk,
            "high_risk_events": high_risk_events
        }

    def get_decision_analytics(self) -> Dict[str, Any]:
        """
        Analyzes drive mode and ride height alignments with detected terrains.
        """
        timeline = self.get_timeline_data()
        if timeline.empty:
            return {
                "alignment_score": 100.0,
                "mismatch_count": 0,
                "mismatches": []
            }

        mismatches = []
        correct_frames = 0
        total_frames = len(timeline)

        for _, row in timeline.iterrows():
            terrain = row["terrain_type"]
            mode = row["drive_mode"]
            height = row["ride_height"]
            is_mismatch = False
            reasons = []

            # Check Drive Mode
            if terrain in ["Mud", "Rock", "Sand"]:
                if mode not in ["Offroad", "Custom"]:
                    is_mismatch = True
                    reasons.append(f"Drive mode should be Offroad/Custom on {terrain} (Actual: {mode})")
            elif terrain in ["Asphalt"]:
                if mode not in ["Comfort", "Eco", "Sport"]:
                    is_mismatch = True
                    reasons.append(f"Drive mode should be Comfort/Eco/Sport on Asphalt (Actual: {mode})")

            # Check Ride Height
            if terrain == "Rock":
                if height != "Extra High":
                    is_mismatch = True
                    reasons.append(f"Ride height should be Extra High on Rock (Actual: {height})")
            elif terrain in ["Mud", "Sand"]:
                if height not in ["High", "Extra High"]:
                    is_mismatch = True
                    reasons.append(f"Ride height should be High/Extra High on {terrain} (Actual: {height})")
            elif terrain == "Asphalt":
                if height not in ["Normal", "Low"]:
                    is_mismatch = True
                    reasons.append(f"Ride height should be Normal/Low on Asphalt (Actual: {height})")

            if is_mismatch:
                mismatches.append({
                    "frame_id": int(row["frame_id"]),
                    "timestamp": float(row["timestamp"]),
                    "terrain": terrain,
                    "drive_mode": mode,
                    "ride_height": height,
                    "reasons": reasons
                })
            else:
                correct_frames += 1

        alignment_score = (correct_frames / total_frames) * 100 if total_frames > 0 else 100.0

        return {
            "alignment_score": round(alignment_score, 1),
            "mismatch_count": len(mismatches),
            "mismatches": mismatches[:20]
        }

    def get_performance_metrics(self) -> Dict[str, Any]:
        """
        Computes overall control performance metrics:
        - command_success_rate: percentage of executed vs failed/pending commands
        - active_suspension_rate: commands containing suspension adjustments
        - transition_frequency: number of mode or height changes
        """
        if self.frames_df.empty:
            return {
                "command_success_rate": 100.0,
                "total_commands": 0,
                "failed_commands": 0,
                "suspension_adjustments": 0,
                "mode_transitions": 0,
                "height_transitions": 0
            }

        total_commands = len(self.commands_df)
        failed_commands = len(self.commands_df[self.commands_df["status"] == "Failed"]) if total_commands > 0 else 0
        success_rate = ((total_commands - failed_commands) / total_commands) * 100 if total_commands > 0 else 100.0

        suspension_adjustments = len(self.commands_df[self.commands_df["command"].str.contains("Suspension", case=False, na=False)])

        mode_transitions = (self.frames_df["drive_mode"].shift() != self.frames_df["drive_mode"]).sum() - 1
        height_transitions = (self.frames_df["ride_height"].shift() != self.frames_df["ride_height"]).sum() - 1

        return {
            "command_success_rate": round(success_rate, 1),
            "total_commands": total_commands,
            "failed_commands": failed_commands,
            "suspension_adjustments": suspension_adjustments,
            "mode_transitions": max(0, int(mode_transitions)),
            "height_transitions": max(0, int(height_transitions))
        }

    def get_detection_analytics_by_terrain(self) -> pd.DataFrame:
        """
        Groups confidence and severity metrics by terrain type.
        """
        if self.detections_df.empty:
            return pd.DataFrame(columns=["terrain_type", "avg_confidence", "avg_severity", "detection_count"])

        grouped = self.detections_df.groupby("terrain_type").agg(
            avg_confidence=("confidence", "mean"),
            avg_severity=("severity", "mean"),
            detection_count=("confidence", "count")
        ).round(3).reset_index()
        
        return grouped
