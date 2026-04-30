"""
Notification Service - Email (SMTP) & AI Voice Call (Vapi.ai) Alert System
Extreme Resilience Edition: Auto-port fallback and deep diagnostic logging.
"""
import smtplib
import os
import httpx
import asyncio
import logging
import sys
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from backend.core.config import settings

# Configure logging for immediate flush to Render console
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger("ChainQuakeAlerts")

class NotificationService:
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER or "smtp.gmail.com"
        self.smtp_port = settings.SMTP_PORT or 587
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.vapi_api_key = settings.VAPI_API_KEY
        self.vapi_assistant_id = settings.VAPI_ASSISTANT_ID
        self.vapi_phone_id = settings.VAPI_PHONE_NUMBER_ID
        self.history = []
        
        logger.info(f"ALERTS ENGINE: Armed. Email: {'READY' if self.smtp_username else 'DISABLED'}. Voice: {'READY' if self.vapi_api_key else 'DISABLED'}")

    def send_email_alert(self, to_email: str, subject: str, body: str, alert_data: dict = None):
        """Send an email alert with automatic port/protocol fallback"""
        logger.info(f"📫 DISPATCH: Attempting delivery to {to_email} via {self.smtp_server}")
        
        if not self.smtp_username or not self.smtp_password:
            logger.error("📫 DISPATCH FAILED: SMTP Credentials missing in Render Environment.")
            return False

        msg = MIMEMultipart("alternative")
        msg["From"] = f"ChainQuake Intelligence <{self.smtp_username}>"
        msg["To"] = to_email
        msg["Subject"] = f"⚡ TACTICAL ALERT: {subject}"
        
        html_content = self._build_email_html(subject, body, alert_data)
        msg.attach(MIMEText(body, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        # Try Port 587 (TLS) first, then fallback to 465 (SSL)
        ports = [587, 465]
        success = False
        last_error = ""

        for port in ports:
            try:
                logger.info(f"📫 DISPATCH: Trying connection on PORT {port}...")
                if port == 465:
                    server = smtplib.SMTP_SSL(self.smtp_server, port, timeout=10)
                else:
                    server = smtplib.SMTP(self.smtp_server, port, timeout=10)
                    server.starttls()
                
                server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.smtp_username, to_email, msg.as_string())
                server.quit()
                
                logger.info(f"📫 DISPATCH SUCCESS: Intelligence delivered to {to_email} on port {port}")
                success = True
                break
            except Exception as e:
                last_error = str(e)
                logger.warning(f"📫 DISPATCH WARNING: Port {port} failed: {last_error}")
                continue

        if not success:
            logger.error(f"📫 DISPATCH CRITICAL: All mail protocols failed. Error: {last_error}")
            return False
        
        return True

    def make_phone_call(self, to_phone: str, message: str, alert_data: dict = None):
        """Initiate AI voice call via Vapi.ai"""
        logger.info(f"📞 DISPATCH: Attempting voice uplink to {to_phone}")
        
        if not self.vapi_api_key or not self.vapi_assistant_id:
            logger.error("📞 DISPATCH FAILED: Vapi credentials missing.")
            return False

        if not to_phone.startswith('+'):
            to_phone = f"+91{to_phone}"

        try:
            url = "https://api.vapi.ai/call"
            headers = {"Authorization": f"Bearer {self.vapi_api_key}", "Content-Type": "application/json"}
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
            
            with httpx.Client(timeout=15.0) as client:
                response = client.post(url, json=payload, headers=headers)
            
            if response.status_code in [200, 201]:
                logger.info(f"📞 DISPATCH SUCCESS: AI Voice initiated to {to_phone}")
                return True
            else:
                logger.error(f"📞 DISPATCH FAILED: API Status {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"📞 DISPATCH EXCEPTION: {str(e)}")
            return False

    def _build_email_html(self, subject, body, alert_data):
        severity = alert_data.get("severity", "high") if alert_data else "high"
        color = {"critical": "#ef4444", "high": "#f59e0b"}.get(severity, "#3b82f6")
        return f\"\"\"
        <html>
        <body style="background:#000;color:#fff;font-family:sans-serif;padding:40px;">
            <div style="max-width:600px;border:1px solid #333;border-radius:20px;overflow:hidden;">
                <div style="background:linear-gradient(135deg, #7c3aed, #3b82f6);padding:30px;text-align:center;">
                    <h1 style="margin:0;letter-spacing:5px;">CHAINQUAKE</h1>
                </div>
                <div style="padding:40px;background:#111;">
                    <div style="background:{color};display:inline-block;padding:4px 12px;border-radius:4px;font-size:10px;font-weight:900;margin-bottom:20px;">{severity.upper()}</div>
                    <h2 style="margin:0 0 20px 0;">{subject}</h2>
                    <p style="color:#888;line-height:1.7;">{body}</p>
                    <a href="https://chainquake-96ni.onrender.com" style="display:inline-block;margin-top:30px;background:#fff;color:#000;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:900;">OPEN WAR ROOM</a>
                </div>
            </div>
        </body>
        </html>\"\"\"

notification_service = NotificationService()
