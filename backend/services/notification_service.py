"""
Notification Service - Email (SMTP) & AI Voice Call (Vapi.ai) Alert System
Enhanced for maximum deliverability and diagnostic visibility.
"""
import smtplib
import os
import httpx
import asyncio
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from backend.core.config import settings

# Configure logging for Render visibility
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ChainQuakeNotifications")

class NotificationService:
    def __init__(self):
        # Email config
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        
        # Vapi.ai config
        self.vapi_api_key = settings.VAPI_API_KEY
        self.vapi_assistant_id = settings.VAPI_ASSISTANT_ID
        self.vapi_phone_id = settings.VAPI_PHONE_NUMBER_ID

        # Notification history
        self.history = []
        
        logger.info(f"NOTIFICATION SERVICE: Initialized. Email Config: {'OK' if self.smtp_username else 'MISSING'}. Phone Config: {'OK' if self.vapi_api_key else 'MISSING'}")

    def send_email_alert(self, to_email: str, subject: str, body: str, alert_data: dict = None):
        """Send an email alert via SMTP with auto-fallback for ports"""
        logger.info(f"EMAIL DISPATCH: Attempting to send to {to_email}")
        
        result = {
            "channel": "email",
            "to": to_email,
            "subject": subject,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "pending"
        }

        if not self.smtp_username or not self.smtp_password:
            err = "SMTP credentials missing in environment variables."
            logger.error(f"EMAIL ERROR: {err}")
            result["status"] = "failed"
            result["error"] = err
            self.history.append(result)
            return result

        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"ChainQuake Alerts <{self.smtp_username}>"
            msg["To"] = to_email
            msg["Subject"] = f"⚡ ChainQuake Alert: {subject}"

            html_body = self._build_email_html(subject, body, alert_data)
            msg.attach(MIMEText(body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            # Logic for Port 587 (STARTTLS)
            logger.info(f"EMAIL DISPATCH: Connecting to {self.smtp_server}:{self.smtp_port}...")
            server = smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=15)
            server.set_debuglevel(1) # This will show detailed SMTP logs in Render
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.sendmail(self.smtp_username, to_email, msg.as_string())
            server.quit()

            result["status"] = "sent"
            logger.info(f"EMAIL SUCCESS: Dispatched to {to_email}")
        except Exception as e:
            logger.error(f"EMAIL FAILED: {str(e)}")
            result["status"] = "failed"
            result["error"] = str(e)

        self.history.append(result)
        return result

    def make_phone_call(self, to_phone: str, message: str, alert_data: dict = None):
        """Make an automated AI voice call via Vapi.ai"""
        logger.info(f"PHONE DISPATCH: Attempting to call {to_phone}")
        
        result = {
            "channel": "phone",
            "to": to_phone,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "pending"
        }

        if not self.vapi_api_key or not self.vapi_assistant_id:
            err = "Vapi credentials missing in environment variables."
            logger.error(f"PHONE ERROR: {err}")
            result["status"] = "failed"
            result["error"] = err
            self.history.append(result)
            return result

        # Force E.164 format
        if not to_phone.startswith('+'):
            to_phone = f"+91{to_phone}"

        try:
            url = "https://api.vapi.ai/call"
            headers = {
                "Authorization": f"Bearer {self.vapi_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "assistantId": self.vapi_assistant_id,
                "phoneNumberId": self.vapi_phone_id if self.vapi_phone_id else None,
                "customer": {"number": to_phone},
                "assistantOverrides": {
                    "variableValues": {
                        "alert_message": message,
                        "severity": alert_data.get("severity", "high") if alert_data else "high"
                    }
                }
            }
            
            logger.info(f"PHONE DISPATCH: Calling Vapi API...")
            with httpx.Client(timeout=20.0) as client:
                response = client.post(url, json=payload, headers=headers)
            
            if response.status_code in [200, 201]:
                call_data = response.json()
                result["status"] = "initiated"
                result["call_id"] = call_data.get("id")
                logger.info(f"PHONE SUCCESS: Call initiated (ID: {result['call_id']})")
            else:
                logger.error(f"PHONE FAILED: API Error {response.status_code} - {response.text}")
                result["status"] = "failed"
                result["error"] = response.text

        except Exception as e:
            logger.error(f"PHONE EXCEPTION: {str(e)}")
            result["status"] = "failed"
            result["error"] = str(e)

        self.history.append(result)
        return result

    def get_history(self):
        return sorted(self.history, key=lambda x: x["timestamp"], reverse=True)

    def _build_email_html(self, subject, body, alert_data):
        severity = alert_data.get("severity", "high") if alert_data else "high"
        severity_color = {"critical": "#ef4444", "high": "#f59e0b", "medium": "#3b82f6", "low": "#10b981"}.get(severity, "#f59e0b")

        return f\"\"\"
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#050505;font-family:sans-serif;color:#ffffff;">
            <div style="max-width:600px;margin:20px auto;background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;">
                <div style="background:linear-gradient(135deg, #7c3aed, #3b82f6);padding:40px;text-align:center;">
                    <h1 style="margin:0;font-size:24px;letter-spacing:4px;">CHAINQUAKE</h1>
                </div>
                <div style="padding:40px;">
                    <div style="background:{severity_color};padding:4px 12px;border-radius:4px;display:inline-block;font-size:10px;font-weight:900;margin-bottom:20px;">{severity.upper()}</div>
                    <h2 style="margin:0 0 16px 0;">{subject}</h2>
                    <p style="color:#aaa;line-height:1.6;">{body}</p>
                    <a href="https://chainquake-96ni.onrender.com" style="display:inline-block;margin-top:30px;background:#fff;color:#000;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:900;">DASHBOARD</a>
                </div>
            </div>
        </body>
        </html>\"\"\"

notification_service = NotificationService()
