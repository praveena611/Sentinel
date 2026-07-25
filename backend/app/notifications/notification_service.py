import requests
from typing import Dict, Any
from datetime import datetime

from app.core.config import settings


class NtfyNotificationService:
    """
    Mandatory single notification service for SentinelAI using ntfy.sh.
    Publishes real-time push emergency notifications to trusted channels.
    """

    def __init__(self, topic: str = None, base_url: str = None):
        self.topic = topic or settings.NTFY_TOPIC
        self.base_url = base_url or settings.NTFY_BASE_URL
        self.publish_url = f"{self.base_url.rstrip('/')}/{self.topic}"

    def build_message(
        self,
        user_name: str,
        emergency_type: str,
        confidence_score: float,
        latitude: float,
        longitude: float,
        status: str,
        created_at: datetime
    ) -> str:
        """
        Build exact formatted notification payload as mandated in specification.
        """
        maps_link = f"https://maps.google.com/?q={latitude},{longitude}"
        confidence_pct = f"{int(confidence_score * 100)}%" if confidence_score <= 1.0 else f"{confidence_score}%"
        time_str = created_at.strftime("%H:%M:%S")

        message = (
            f"🚨 SOS ALERT\n\n"
            f"User: {user_name}\n"
            f"Emergency: {emergency_type}\n"
            f"Confidence: {confidence_pct}\n"
            f"Location: {maps_link}\n"
            f"Time: {time_str}\n"
            f"Status: {status}"
        )
        return message

    def send_sos_alert(
        self,
        user_name: str,
        emergency_type: str,
        confidence_score: float,
        latitude: float,
        longitude: float,
        status: str,
        created_at: datetime
    ) -> Dict[str, Any]:
        """
        Publish formatted emergency alert to ntfy.sh topic.
        Returns dict containing delivery status ("SUCCESS" or "FAILED") and details.
        """
        message_body = self.build_message(
            user_name=user_name,
            emergency_type=emergency_type,
            confidence_score=confidence_score,
            latitude=latitude,
            longitude=longitude,
            status=status,
            created_at=created_at
        )

        # Ensure headers use standard ASCII characters for HTTP spec compatibility
        headers = {
            "Title": f"EMERGENCY: {emergency_type.upper()}",
            "Priority": "5",  # Maximum priority in ntfy
            "Tags": "warning,rotating_light,sos,emergency",
            "Click": f"https://maps.google.com/?q={latitude},{longitude}"
        }

        try:
            response = requests.post(
                self.publish_url,
                data=message_body.encode('utf-8'),
                headers=headers,
                timeout=8.0
            )

            if response.status_code == 200 or response.status_code == 201:
                return {
                    "status": "SUCCESS",
                    "status_code": response.status_code,
                    "topic": self.topic,
                    "published_at": datetime.utcnow().isoformat()
                }
            else:
                return {
                    "status": "FAILED",
                    "status_code": response.status_code,
                    "error": f"HTTP Error {response.status_code}: {response.text}"
                }

        except Exception as e:
            return {
                "status": "FAILED",
                "error": str(e)
            }
