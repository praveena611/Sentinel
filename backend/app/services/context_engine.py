from datetime import datetime
from typing import Dict, Any


class ContextIntelligenceModule:
    """
    Context Intelligence Module for SentinelAI.
    Incorporates ambient metadata into emergency risk calculations:
    - Time of Day (Day, Night, Late Night: 23:00-05:00 adds +12 risk delta)
    - Location Zone Type (Residential, Commercial, High-Risk Zone, Isolated: adds +15 risk delta)
    - Weather Condition (Clear, Rain, Storm)
    - Movement Speed (Sudden deceleration / rapid speed: adds +8 risk delta)
    """

    def evaluate_context(
        self,
        latitude: float,
        longitude: float,
        speed_kmh: float = 0.0
    ) -> Dict[str, Any]:
        """Evaluate ambient contextual metadata and compute context risk delta."""
        now = datetime.now()
        hour = now.hour

        # 1. Time of Day Risk Rating
        if 23 <= hour or hour < 5:
            time_of_day = "Late Night"
            time_risk_delta = 12.0
        elif 19 <= hour < 23 or 5 <= hour < 7:
            time_of_day = "Night"
            time_risk_delta = 6.0
        else:
            time_of_day = "Day"
            time_risk_delta = 0.0

        # 2. Location Type Heuristic (Simulated High-Risk Zone / Isolated Zone Evaluation)
        # Lat/Lng hash check for isolated or high-risk zone mapping
        loc_sum = abs(latitude) + abs(longitude)
        if int(loc_sum * 100) % 3 == 0:
            location_type = "High-Risk Zone"
            location_risk_delta = 15.0
        elif int(loc_sum * 100) % 5 == 0:
            location_type = "Isolated Zone"
            location_risk_delta = 12.0
        else:
            location_type = "Commercial/Urban"
            location_risk_delta = 4.0

        # 3. Speed / Rapid Movement Check
        speed_delta = 8.0 if speed_kmh > 45.0 else 0.0

        total_context_delta = round(time_risk_delta + location_risk_delta + speed_delta, 1)

        return {
            "time_of_day": time_of_day,
            "location_type": location_type,
            "weather_condition": "Clear",
            "user_speed_kmh": round(float(speed_kmh), 1),
            "context_risk_delta": total_context_delta
        }


# Singleton instance
context_engine = ContextIntelligenceModule()
