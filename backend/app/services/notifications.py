import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from twilio.rest import Client as TwilioClient

class NotificationService:
    def __init__(self):
        self.sg_api_key = os.getenv("SENDGRID_API_KEY")
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
        self.email_from = os.getenv("EMAIL_FROM")

    async def send_email(self, to_email: str, subject: str, content: str):
        if not self.sg_api_key: return
        message = Mail(
            from_email=self.email_from,
            to_emails=to_email,
            subject=subject,
            plain_text_content=content
        )
        try:
            sg = SendGridAPIClient(self.sg_api_key)
            sg.send(message)
        except Exception as e:
            print(f"Email Error: {e}")

    async def send_sms(self, to_phone: str, message: str):
        if not self.twilio_sid: return
        try:
            client = TwilioClient(self.twilio_sid, self.twilio_token)
            client.messages.create(
                body=message,
                from_=self.twilio_phone,
                to=to_phone
            )
        except Exception as e:
            print(f"SMS Error: {e}")

notification_service = NotificationService()
