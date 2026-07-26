from typing import Dict, Any, List


class ExplainableAIEngine:
    """
    Explainable AI (XAI) Module for SentinelAI.
    Generates human-readable reasoning and feature attributions for every risk prediction.
    """

    def generate_explanation(
        self,
        risk_score: float,
        severity_level: str,
        primary_threat: str,
        fused_confidence: float,
        active_modalities: List[str],
        context_details: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate human-readable summary and feature attributions."""
        attributions = []

        # 1. Modality Attributions
        mod_str = ", ".join(active_modalities)
        attributions.append(f"Fused evidence across modalities ({mod_str}) with {(fused_confidence * 100):.1f}% confidence.")

        # 2. Context Attributions
        time_of_day = context_details.get("time_of_day", "Day")
        loc_type = context_details.get("location_type", "Urban")
        delta = context_details.get("context_risk_delta", 0.0)

        if delta > 0:
            attributions.append(f"Ambient context ({time_of_day} in {loc_type}) added +{delta:.1f} risk points.")

        # 3. Summary Reasoning
        summary = (
            f"{severity_level.upper()} SEVERITY RISK ({risk_score:.1f}/100): "
            f"Primary threat identified as {primary_threat} Emergency based on {mod_str} evidence. "
            f"Contextual risk factor ({loc_type}, {time_of_day}) contributed to final rating. Immediate dispatch confirmed."
        )

        return {
            "severity_level": severity_level,
            "risk_score": risk_score,
            "summary_reason": summary,
            "feature_attributions": attributions
        }


# Singleton instance
xai_engine = ExplainableAIEngine()
