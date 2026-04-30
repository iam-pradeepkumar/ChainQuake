"""
Notification Service - Email (SMTP) & AI Voice Call (Vapi.ai) Alert System
Tactical Resilience: Added Resend API Support as SMTP fallback.
"""
import smtplib
import os
import httpx
import asyncio
import logging
import sys
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from backend.core.config import settings

# Configure logging
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
        
        # Resend API (Recommended for Render)
        self.resend_api_key = os.getenv("RESEND_API_KEY", "")
        
        self.vapi_api_key = settings.VAPI_API_KEY
        self.vapi_assistant_id = settings.VAPI_ASSISTANT_ID
        self.vapi_phone_id = settings.VAPI_PHONE_NUMBER_ID
        
        logger.info(f"ALERTS ENGINE: Armed. Email: {'READY' if self.smtp_username else 'MISSING'}. Voice: {'READY' if self.vapi_api_key else 'MISSING'}")
        if not self.resend_api_key and self.smtp_username:
            logger.warning("📫 TIP: Render often blocks SMTP. If Email fails, add RESEND_API_KEY for HTTP-based delivery.")

    def send_email_alert(self, to_email: str, subject: str, body: str, alert_data: dict = None):
        """Send an email alert with automatic Fallback to Resend API if SMTP is blocked"""
        logger.info(f"📫 DISPATCH: Attempting delivery to {to_email}")
        
        # Try Resend API first if key exists (much more reliable on Render)
        if self.resend_api_key:
            return self._send_via_resend(to_email, subject, body, alert_data)
        
        # Fallback to SMTP
        return self._send_via_smtp(to_email, subject, body, alert_data)

    def _send_via_resend(self, to_email: str, subject: str, body: str, alert_data: dict = None):
        """HTTP-based email delivery (bypasses Render's SMTP blocks)"""
        logger.info("📫 DISPATCH: Using RESEND API (HTTP)...")
        try:
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {self.resend_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "from": "ChainQuake Intelligence <onboarding@resend.dev>",
                "to": to_email,
                "subject": f"⚡ TACTICAL ALERT: {subject}",
                "html": self._build_email_html(subject, body, alert_data)
            }
            
            with httpx.Client(timeout=15.0) as client:
                response = client.post(url, json=payload, headers=headers)
            
            if response.status_code in [200, 201]:
                logger.info(f"📫 DISPATCH SUCCESS: Resend API delivered to {to_email}")
                return True
            else:
                logger.error(f"📫 DISPATCH FAILED: Resend API Error {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"📫 DISPATCH EXCEPTION (Resend): {str(e)}")
            return False

    def _send_via_smtp(self, to_email: str, subject: str, body: str, alert_data: dict = None):
        """Standard SMTP delivery (often blocked on Cloud/Render)"""
        if not self.smtp_username or not self.smtp_password:
            logger.error("📫 DISPATCH FAILED: SMTP Credentials missing.")
            return False

        msg = MIMEMultipart("alternative")
        msg["From"] = f"ChainQuake <{self.smtp_username}>"
        msg["To"] = to_email
        msg["Subject"] = f"⚡ TACTICAL ALERT: {subject}"
        msg.attach(MIMEText(body, "plain"))
        msg.attach(MIMEText(self._build_email_html(subject, body, alert_data), "html"))

        # Render often blocks ports 587/465. We try to be clever but usually it's a firewall.
        for port in [587, 465]:
            try:
                logger.info(f"📫 DISPATCH: Trying SMTP on PORT {port}...")
                if port == 465:
                    server = smtplib.SMTP_SSL(self.smtp_server, port, timeout=10)
                else:
                    server = smtplib.SMTP(self.smtp_server, port, timeout=10)
                    server.starttls()
                
                server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.smtp_username, to_email, msg.as_string())
                server.quit()
                logger.info(f"📫 DISPATCH SUCCESS: SMTP delivered to {to_email}")
                return True
            except Exception as e:
                logger.warning(f"📫 DISPATCH WARNING: Port {port} failed: {str(e)}")
                continue
        
        logger.error("📫 DISPATCH CRITICAL: SMTP is blocked by the host. Please use RESEND_API_KEY.")
        return False

    def make_phone_call(self, to_phone: str, message: str, alert_data: dict = None):
        """AI voice call via Vapi.ai"""
        logger.info(f"📞 DISPATCH: Attempting voice uplink to {to_phone}")
        if not self.vapi_api_key or not self.vapi_assistant_id:
            logger.error("📞 DISPATCH FAILED: Vapi credentials missing.")
            return False

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
                "customer": {"number": to_phone}
            }
            
            # Only add phoneNumberId if explicitly provided
            if self.vapi_phone_id:
                payload["phoneNumberId"] = self.vapi_phone_id
                
            # Add overrides for dynamic intelligence reporting
            payload["assistantOverrides"] = {
                "variableValues": {
                    "alert_message": message
                }
            }
            
            with httpx.Client(timeout=15.0) as client:
                response = client.post(url, json=payload, headers=headers)
            
            if response.status_code in [200, 201]:
                logger.info(f"📞 DISPATCH SUCCESS: AI Voice initiated to {to_phone}")
                return True
            else:
                logger.error(f"📞 DISPATCH FAILED: Vapi API Error {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"📞 DISPATCH EXCEPTION: {str(e)}")
            return False

    def _build_email_html(self, subject, body, alert_data):
        severity = alert_data.get("severity", "high") if alert_data else "high"
        color = {"critical": "#ef4444", "high": "#f59e0b"}.get(severity, "#3b82f6")
        return f"""
        <html>
        <body style="background:#000;color:#fff;font-family:sans-serif;padding:40px;">
            <div style="max-width:600px;border:1px solid #333;border-radius:20px;overflow:hidden;margin:0 auto;">
                <div style="background:linear-gradient(135deg, #7c3aed, #3b82f6);padding:30px;text-align:center;">
                    <h1 style="margin:0;letter-spacing:5px;">CHAINQUAKE</h1>
                </div>
                <div style="padding:40px;background:#111;">
                    <div style="background:{color};display:inline-block;padding:4px 12px;border-radius:4px;font-size:10px;font-weight:900;margin-bottom:20px;">{severity.upper()}</div>
                    <h2 style="margin:0 0 20px 0;font-size:22px;">{subject}</h2>
                    <p style="color:#aaa;line-height:1.7;font-size:16px;">{body}</p>
                    <div style="margin-top:30px;padding-top:20px;border-top:1px solid #222;">
                         <a href="https://chainquake-96ni.onrender.com" style="display:inline-block;background:#fff;color:#000;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:900;font-size:12px;">OPEN OPERATOR DASHBOARD</a>
                    </div>
                </div>
            </div>
        </body>
        </html>"""

notification_service = NotificationService()
