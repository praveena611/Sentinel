from typing import Dict, Any


class RiskAssessmentEngine:
    """
    Risk Assessment Engine for SentinelAI.
    Computes calibrated 0–100 Risk Score and maps to 4 Severity Levels:
    - Low (0 - 29)
    - Medium (30 - 59)
    - High (60 - 79)
    - Critical (80 - 100)
    """

    def calculate_risk(
        self,
        fused_confidence: float,
        context_risk_delta: float,
        is_manual_sos: bool = False
    ) -> Dict[str, Any]:
        """
        Calculate Risk Score and Severity Level.
        Formula: (Fused Confidence * 70) + Context Delta + SOS Bonus (15)
        """
        base_score = fused_confidence * 70.0
        sos_bonus = 15.0 if is_manual_sos else 0.0

        raw_score = base_score + context_risk_delta + sos_bonus
        final_risk_score = round(min(max(raw_score, 10.0), 100.0), 1)

        # Severity Threshold Mapping
        if final_risk_score >= 80.0:
            severity = "Critical"
        elif final_risk_score >= 60.0:
            severity = "High"
        elif final_risk_score >= 30.0:
            severity = "Medium"
        else:
            severity = "Low"

        return {
            "risk_score": final_risk_score,
            "severity_level": severity
        }


# Singleton instance
risk_engine = RiskAssessmentEngine()
