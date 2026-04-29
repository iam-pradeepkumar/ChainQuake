"""
Notification Service - Email (SMTP) & Phone Call (Twilio) Alert System
Handles dispatching critical supply chain alerts via multiple channels.
"""
import smtplib
import os
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

        # Twilio config
        self.twilio_sid = settings.TWILIO_ACCOUNT_SID
        self.twilio_token = settings.TWILIO_AUTH_TOKEN
        self.twilio_from = settings.TWILIO_PHONE_NUMBER
        self.twilio_client = None

        if self.twilio_sid and self.twilio_token:
            try:
                from twilio.rest import Client
                self.twilio_client = Client(self.twilio_sid, self.twilio_token)
                print("NOTIFICATION: Twilio client initialized successfully.")
            except Exception as e:
                print(f"NOTIFICATION: Twilio init failed: {e}")

        # Notification history (persisted in memory, could be Firestore)
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
            result["error"] = "SMTP credentials not configured. Set SMTP_USERNAME and SMTP_PASSWORD env vars."
            self.history.append(result)
            return result

        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"ChainQuake Alerts <{self.from_email}>"
            msg["To"] = to_email
            msg["Subject"] = f"⚡ ChainQuake Alert: {subject}"

            # Build rich HTML email
            html_body = self._build_email_html(subject, body, alert_data)
            plain_body = f"ChainQuake Alert\n\n{subject}\n\n{body}\n\nTimestamp: {result['timestamp']}"

            msg.attach(MIMEText(plain_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.sendmail(self.from_email, to_email, msg.as_string())
            server.quit()

            result["status"] = "sent"
            print(f"NOTIFICATION: Email sent to {to_email} — {subject}")
        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
            print(f"NOTIFICATION: Email failed — {e}")

        self.history.append(result)
        return result

    def make_phone_call(self, to_phone: str, message: str, alert_data: dict = None):
        """Make an automated phone call via Twilio"""
        result = {
            "channel": "phone",
            "to": to_phone,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "pending"
        }

        if not self.twilio_client:
            result["status"] = "failed"
            result["error"] = "Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER env vars."
            self.history.append(result)
            return result

        if not self.twilio_from:
            result["status"] = "failed"
            result["error"] = "TWILIO_PHONE_NUMBER not set."
            self.history.append(result)
            return result

        try:
            # Build TwiML for the call
            severity = alert_data.get("severity", "high") if alert_data else "high"
            twiml = f"""<Response>
                <Pause length="1"/>
                <Say voice="alice" language="en-US">
                    Attention. This is an automated alert from Chain Quake Supply Chain Intelligence.
                </Say>
                <Pause length="1"/>
                <Say voice="alice" language="en-US">
                    Priority Level: {severity}.
                </Say>
                <Pause length="1"/>
                <Say voice="alice" language="en-US">
                    {message}
                </Say>
                <Pause length="1"/>
                <Say voice="alice" language="en-US">
                    Please log into your Chain Quake dashboard immediately for full details.
                    This message will repeat once.
                </Say>
                <Pause length="2"/>
                <Say voice="alice" language="en-US">
                    Repeating. {message}
                </Say>
                <Pause length="1"/>
                <Say voice="alice" language="en-US">
                    End of alert. Goodbye.
                </Say>
            </Response>"""

            call = self.twilio_client.calls.create(
                twiml=twiml,
                to=to_phone,
                from_=self.twilio_from
            )

            result["status"] = "initiated"
            result["call_sid"] = call.sid
            print(f"NOTIFICATION: Phone call initiated to {to_phone} — SID: {call.sid}")
        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
            print(f"NOTIFICATION: Phone call failed — {e}")

        self.history.append(result)
        return result

    def get_history(self):
        """Get notification history"""
        return sorted(self.history, key=lambda x: x["timestamp"], reverse=True)

    def get_config_status(self):
        """Check what notification channels are configured"""
        return {
            "email": {
                "configured": bool(self.smtp_username and self.smtp_password),
                "smtp_server": self.smtp_server,
                "from": self.from_email if self.smtp_username else None
            },
            "phone": {
                "configured": bool(self.twilio_client),
                "from_number": self.twilio_from if self.twilio_client else None
            }
        }

    def _build_email_html(self, subject, body, alert_data):
        """Build a styled HTML email"""
        severity = alert_data.get("severity", "high") if alert_data else "high"
        company = alert_data.get("company_id", "") if alert_data else ""
        severity_color = {
            "critical": "#ef4444",
            "high": "#f59e0b",
            "medium": "#3b82f6",
            "low": "#10b981"
        }.get(severity, "#f59e0b")

        return f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,system-ui,sans-serif;">
            <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
                <!-- Header -->
                <div style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:32px;border-radius:24px 24px 0 0;text-align:center;">
                    <div style="font-size:28px;font-weight:900;color:white;letter-spacing:3px;">⚡ CHAINQUAKE</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:8px;font-weight:600;">SUPPLY CHAIN INTELLIGENCE ALERT</div>
                </div>

                <!-- Severity Badge -->
                <div style="background:#111;padding:24px 32px;border-left:4px solid {severity_color};">
                    <div style="display:inline-block;background:{severity_color};color:white;padding:6px 16px;border-radius:20px;font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">
                        {severity} PRIORITY
                    </div>
                </div>

                <!-- Content -->
                <div style="background:#111;padding:32px;border-bottom-left-radius:24px;border-bottom-right-radius:24px;">
                    <h2 style="color:white;font-size:20px;font-weight:800;margin:0 0 16px 0;">{subject}</h2>
                    <p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0 0 24px 0;">{body}</p>

                    {f'<div style="background:rgba(255,255,255,0.05);padding:16px;border-radius:12px;margin-bottom:24px;"><span style="color:#64748b;font-size:11px;font-weight:700;">AFFECTED NODE</span><br><span style="color:white;font-size:14px;font-weight:700;">{company}</span></div>' if company else ''}

                    <div style="color:#475569;font-size:11px;font-weight:600;margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);">
                        Timestamp: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}<br>
                        System: ChainQuake Autonomous Intelligence v1.2
                    </div>
                </div>

                <div style="text-align:center;margin-top:24px;">
                    <a href="https://chainquake-96ni.onrender.com" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:800;font-size:13px;letter-spacing:1px;">
                        OPEN DASHBOARD →
                    </a>
                </div>

                <div style="text-align:center;margin-top:20px;color:#475569;font-size:10px;">
                    This is an automated alert from ChainQuake Intelligence Platform.
                </div>
            </div>
        </body>
        </html>"""


notification_service = NotificationService()
