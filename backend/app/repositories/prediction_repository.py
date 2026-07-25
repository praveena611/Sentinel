from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.prediction import Prediction


class PredictionRepository:
    """Repository encapsulating database persistence for Predictions table."""

    def __init__(self, db: Session):
        self.db = db

    def create_prediction(
        self,
        emergency_event_id: int,
        modality: str,
        prediction: str,
        confidence: float
    ) -> Prediction:
        """Create and persist a new Prediction record."""
        pred = Prediction(
            emergency_event_id=emergency_event_id,
            modality=modality,
            prediction=prediction,
            confidence=confidence
        )
        self.db.add(pred)
        self.db.commit()
        self.db.refresh(pred)
        return pred

    def get_by_event_id(self, emergency_event_id: int) -> List[Prediction]:
        """Fetch predictions for an emergency event."""
        return self.db.query(Prediction).filter(
            Prediction.emergency_event_id == emergency_event_id
        ).all()
