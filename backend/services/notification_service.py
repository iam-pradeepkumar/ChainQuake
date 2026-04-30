"""
Notification Service - Email (SMTP) & AI Voice Call (Vapi.ai) Alert System
Optimized for low-latency async dispatching.
"""
import smtplib
import os
import httpx
import asyncio
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
        self.from_email = settings.SMTP_USERNAME # Critical: From must match authenticated user for Gmail

        # Vapi.ai config
        self.vapi_api_key = settings.VAPI_API_KEY
        self.vapi_assistant_id = settings.VAPI_ASSISTANT_ID
        self.vapi_phone_id = settings.VAPI_PHONE_NUMBER_ID

        # Notification history
        self.history = []

    def send_email_alert(self, to_email: str, subject: str, body: str, alert_data: dict = None):
        """Send an email alert via SMTP (Gmail App Password) - Synchronous wrapper for background tasks"""
        result = {
            "channel": "email",
            "to": to_email,
            "subject": subject,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "pending"
        }

        if not self.smtp_username or not self.smtp_password:
            result["status"] = "failed"
            result["error"] = "SMTP credentials missing. Please set SMTP_USERNAME and SMTP_PASSWORD."
            self.history.append(result)
            return result

        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"ChainQuake Alerts <{self.smtp_username}>"
            msg["To"] = to_email
            msg["Subject"] = f"⚡ ChainQuake Alert: {subject}"

            html_body = self._build_email_html(subject, body, alert_data)
            plain_body = f"ChainQuake Alert\n\n{subject}\n\n{body}"

            msg.attach(MIMEText(plain_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            # Use SMTP_SSL for port 465 or STARTTLS for 587
            if self.smtp_port == 465:
                server = smtplib.SMTP_SSL(self.smtp_server, self.smtp_port, timeout=10)
            else:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=10)
                server.starttls()
            
            server.login(self.smtp_username, self.smtp_password)
            server.sendmail(self.smtp_username, to_email, msg.as_string())
            server.quit()

            result["status"] = "sent"
            print(f"NOTIFICATION: Email sent successfully to {to_email}")
        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
            print(f"NOTIFICATION: Email failed to {to_email} — {e}")

        self.history.append(result)
        return result

    def make_phone_call(self, to_phone: str, message: str, alert_data: dict = None):
        """
        Make an automated AI voice call via Vapi.ai.
        Now uses httpx for faster connection pooling.
        """
        result = {
            "channel": "phone",
            "to": to_phone,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "pending"
        }

        if not self.vapi_api_key or not self.vapi_assistant_id:
            result["status"] = "failed"
            result["error"] = "Vapi credentials missing."
            self.history.append(result)
            return result

        # Force E.164 format if missing
        if not to_phone.startswith('+'):
            to_phone = f"+91{to_phone}" # Default to India if no prefix

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
            
            # Using synchronous httpx call as this is usually wrapped in a BackgroundTask thread anyway
            with httpx.Client(timeout=15.0) as client:
                response = client.post(url, json=payload, headers=headers)
            
            if response.status_code in [200, 201]:
                call_data = response.json()
                result["status"] = "initiated"
                result["call_id"] = call_data.get("id")
                print(f"NOTIFICATION: Vapi call initiated to {to_phone}")
            else:
                result["status"] = "failed"
                result["error"] = f"Vapi Error {response.status_code}: {response.text}"
                print(f"NOTIFICATION: Vapi API Error — {response.text}")

        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
            print(f"NOTIFICATION: Vapi call exception — {e}")

        self.history.append(result)
        return result

    def get_history(self):
        return sorted(self.history, key=lambda x: x["timestamp"], reverse=True)

    def get_config_status(self):
        return {
            "email": {"configured": bool(self.smtp_username and self.smtp_password), "user": self.smtp_username},
            "phone": {"configured": bool(self.vapi_api_key and self.vapi_assistant_id)}
        }

    def _build_email_html(self, subject, body, alert_data):
        severity = alert_data.get("severity", "high") if alert_data else "high"
        severity_color = {"critical": "#ef4444", "high": "#f59e0b", "medium": "#3b82f6", "low": "#10b981"}.get(severity, "#f59e0b")

        return f\"\"\"
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#050505;font-family:'Inter', sans-serif;color:#ffffff;">
            <div style="max-width:600px;margin:20px auto;background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;">
                <div style="background:linear-gradient(135deg, #3b82f6, #1d4ed8);padding:40px 20px;text-align:center;">
                    <h1 style="margin:0;font-size:28px;letter-spacing:4px;font-weight:900;">CHAINQUAKE</h1>
                    <p style="margin:10px 0 0 0;font-size:12px;opacity:0.8;letter-spacing:2px;">TACTICAL INTELLIGENCE ALERT</p>
                </div>
                <div style="padding:40px;">
                    <div style="display:inline-block;padding:6px 16px;background:{severity_color};border-radius:4px;font-size:11px;font-weight:900;margin-bottom:24px;">{severity.upper()} PRIORITY</div>
                    <h2 style="margin:0 0 20px 0;font-size:22px;">{subject}</h2>
                    <p style="font-size:16px;line-height:1.7;color:#ccc;margin-bottom:30px;">{body}</p>
                    <div style="padding:20px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.05);margin-bottom:30px;">
                        <div style="font-size:10px;color:#666;font-weight:800;margin-bottom:8px;text-transform:uppercase;">Asset ID</div>
                        <div style="font-family:monospace;font-size:14px;color:#3b82f6;">{alert_data.get('company_id', 'N/A') if alert_data else 'N/A'}</div>
                    </div>
                    <a href="https://chainquake-96ni.onrender.com" style="display:block;text-align:center;background:#fff;color:#000;padding:16px;border-radius:8px;text-decoration:none;font-weight:900;font-size:14px;">ACCESS COMMAND CENTER</a>
                </div>
                <div style="padding:20px;text-align:center;background:#0a0a0a;font-size:11px;color:#444;">
                    &copy; 2024 ChainQuake AI. Autonomous Neural Supply Chain Monitoring.
                </div>
            </div>
        </body>
        </html>\"\"\"


notification_service = NotificationService()
