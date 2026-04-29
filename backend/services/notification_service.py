"""
Notification Service - Email (SMTP) & AI Voice Call (Vapi.ai) Alert System
Handles dispatching critical supply chain alerts via multiple channels.
"""
import smtplib
import os
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from backend.core.config import settings


class NotificationService:
    def __init__(self):
        # Email config
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_USERNAME or "chainquake-alerts@system.com"

        # Vapi.ai config
        self.vapi_api_key = settings.VAPI_API_KEY
        self.vapi_assistant_id = settings.VAPI_ASSISTANT_ID
        self.vapi_phone_id = settings.VAPI_PHONE_NUMBER_ID

        # Notification history
        self.history = []

    def send_email_alert(self, to_email: str, subject: str, body: str, alert_data: dict = None):
        """Send an email alert via SMTP (Gmail App Password)"""
        result = {
            "channel": "email",
            "to": to_email,
            "subject": subject,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "pending"
        }

        if not self.smtp_username or not self.smtp_password:
            result["status"] = "failed"
            result["error"] = "SMTP credentials not configured."
            self.history.append(result)
            return result

        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"ChainQuake Alerts <{self.from_email}>"
            msg["To"] = to_email
            msg["Subject"] = f"⚡ ChainQuake Alert: {subject}"

            html_body = self._build_email_html(subject, body, alert_data)
            plain_body = f"ChainQuake Alert\n\n{subject}\n\n{body}"

            msg.attach(MIMEText(plain_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.sendmail(self.from_email, to_email, msg.as_string())
            server.quit()

            result["status"] = "sent"
        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)

        self.history.append(result)
        return result

    def make_phone_call(self, to_phone: str, message: str, alert_data: dict = None):
        """Make an automated AI voice call via Vapi.ai"""
        result = {
            "channel": "phone",
            "to": to_phone,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "pending"
        }

        if not self.vapi_api_key or not self.vapi_assistant_id:
            result["status"] = "failed"
            result["error"] = "Vapi.ai not configured. Set VAPI_API_KEY and VAPI_ASSISTANT_ID."
            self.history.append(result)
            return result

        try:
            # Prepare Vapi.ai payload
            url = "https://api.vapi.ai/call"
            headers = {
                "Authorization": f"Bearer {self.vapi_api_key}",
                "Content-Type": "application/json"
            }
            
            # Use a transient assistant if we want to customize the initial message dynamically
            # Or use a saved assistant and pass variables
            payload = {
                "assistantId": self.vapi_assistant_id,
                "phoneNumberId": self.vapi_phone_id if self.vapi_phone_id else None,
                "customer": {
                    "number": to_phone
                },
                "assistantOverrides": {
                    "variableValues": {
                        "alert_message": message,
                        "severity": alert_data.get("severity", "high") if alert_data else "high"
                    }
                }
            }
            
            # If no saved phone number ID, Vapi will use their default trial numbers if available
            # or you can provide a 'phoneNumber' object.
            
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            
            if response.status_code in [200, 201]:
                call_data = response.json()
                result["status"] = "initiated"
                result["call_id"] = call_data.get("id")
                print(f"NOTIFICATION: Vapi call initiated to {to_phone}")
            else:
                result["status"] = "failed"
                result["error"] = f"Vapi API Error {response.status_code}: {response.text}"
                print(f"NOTIFICATION: Vapi call failed: {response.text}")

        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
            print(f"NOTIFICATION: Vapi call failed — {e}")

        self.history.append(result)
        return result

    def get_history(self):
        return sorted(self.history, key=lambda x: x["timestamp"], reverse=True)

    def get_config_status(self):
        return {
            "email": {"configured": bool(self.smtp_username and self.smtp_password)},
            "phone": {"configured": bool(self.vapi_api_key and self.vapi_assistant_id), "provider": "vapi.ai"}
        }

    def _build_email_html(self, subject, body, alert_data):
        severity = alert_data.get("severity", "high") if alert_data else "high"
        company = alert_data.get("company_id", "") if alert_data else ""
        severity_color = {"critical": "#ef4444", "high": "#f59e0b", "medium": "#3b82f6", "low": "#10b981"}.get(severity, "#f59e0b")

        return f"""
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:sans-serif;">
            <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
                <div style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:32px;border-radius:24px 24px 0 0;text-align:center;">
                    <div style="font-size:24px;font-weight:900;color:white;letter-spacing:2px;">⚡ CHAINQUAKE</div>
                </div>
                <div style="background:#111;padding:32px;border-bottom-left-radius:24px;border-bottom-right-radius:24px;color:white;">
                    <div style="display:inline-block;background:{severity_color};padding:4px 12px;border-radius:20px;font-size:10px;font-weight:900;margin-bottom:16px;">{severity.upper()}</div>
                    <h2 style="margin:0 0 16px 0;">{subject}</h2>
                    <p style="color:#94a3b8;line-height:1.6;">{body}</p>
                    <a href="https://chainquake-96ni.onrender.com" style="display:inline-block;margin-top:24px;background:#7c3aed;color:white;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:700;">OPEN DASHBOARD</a>
                </div>
            </div>
        </body>
        </html>"""


notification_service = NotificationService()
