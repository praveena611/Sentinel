from typing import List, Dict, Any


class MultimodalDecisionFusionEngine:
    """
    Multimodal Decision Fusion Engine for SentinelAI.
    Fuses evidence across active input modalities using Late Weighted Decision Fusion:
    - Manual SOS Weight: 0.40
    - Vision (YOLOv8) Weight: 0.25
    - Voice Speech (Whisper STT) Weight: 0.20
    - Text NLP (DistilBERT) Weight: 0.15
    Resolves category conflicts and calculates calibrated fused confidence score.
    """

    MODALITY_WEIGHTS = {
        "Manual SOS": 0.40,
        "Image": 0.25,
        "Voice": 0.20,
        "Text": 0.15,
    }

    CATEGORIES = ["Medical", "Crime", "Fire", "Accident", "Disaster"]

    def fuse_evidence(self, evidence_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Fuse list of evidence objects:
        Each evidence item: { "modality": str, "prediction": str, "confidence": float }
        """
        if not evidence_items:
            return {
                "primary_threat": "Medical",
                "fused_confidence": 0.70,
                "active_modalities": ["Manual SOS"],
                "modality_breakdown": {
                    "Manual SOS": {"prediction": "Medical", "confidence": 1.0, "weight": 0.40}
                }
            }

        category_scores = {cat: 0.0 for cat in self.CATEGORIES}
        total_weight = 0.0
        active_modalities = []
        breakdown = {}

        for item in evidence_items:
            modality = item.get("modality", "Text")
            pred_cat = item.get("prediction", "Medical")
            conf = float(item.get("confidence", 0.80))
            weight = self.MODALITY_WEIGHTS.get(modality, 0.15)

            active_modalities.append(modality)
            breakdown[modality] = {
                "prediction": pred_cat,
                "confidence": conf,
                "weight": weight
            }

            if pred_cat in category_scores:
                category_scores[pred_cat] += (conf * weight)
                total_weight += weight

        if total_weight > 0:
            primary_threat = max(category_scores, key=category_scores.get)
            fused_score = category_scores[primary_threat] / total_weight
            # Agreement boost if multiple modalities agree on the same category
            category_votes = [item.get("prediction") for item in evidence_items]
            matching_votes = category_votes.count(primary_threat)
            agreement_bonus = 0.05 if matching_votes > 1 else 0.0
            calibrated_confidence = min(0.70 + (fused_score * 0.25) + agreement_bonus, 0.99)
        else:
            primary_threat = "Medical"
            calibrated_confidence = 0.75

        return {
            "primary_threat": primary_threat,
            "fused_confidence": round(float(calibrated_confidence), 3),
            "active_modalities": list(set(active_modalities)),
            "modality_breakdown": breakdown
        }


# Singleton instance
fusion_engine = MultimodalDecisionFusionEngine()
