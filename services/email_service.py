"""Small SMTP email service used for account and password-reset messages."""
import os
import smtplib
from email.message import EmailMessage


def send_email(recipient, subject, body):
    """Send a plain-text email. Returns False when SMTP has not been configured."""
    host = os.getenv('SMTP_HOST', '').strip()
    sender = os.getenv('SMTP_FROM', '').strip()
    if not host or not sender:
        print('Email not sent: configure SMTP_HOST and SMTP_FROM.')
        return False

    message = EmailMessage()
    message['Subject'] = subject
    message['From'] = sender
    message['To'] = recipient
    message.set_content(body)
    port = int(os.getenv('SMTP_PORT', '587'))
    username = os.getenv('SMTP_USERNAME', '').strip()
    password = os.getenv('SMTP_PASSWORD', '')
    try:
        # A mail provider outage must not leave the auth pages loading indefinitely.
        with smtplib.SMTP(host, port, timeout=8) as server:
            if os.getenv('SMTP_USE_TLS', 'true').lower() == 'true':
                server.starttls()
            if username:
                server.login(username, password)
            server.send_message(message)
        return True
    except (OSError, smtplib.SMTPException) as error:
        print(f'Email delivery failed: {error}')
        return False


def send_registration_email(user):
    name = user['first_name'] or user['username']
    return send_email(user['email'], 'Welcome to Campus Cognition',
                      f'Hello {name},\n\nYour Campus Cognition account is registered and ready to use.\n\nCampus Cognition')


def send_password_reset_email(user, reset_url):
    name = user['first_name'] or user['username']
    return send_email(user['email'], 'Reset your Campus Cognition password',
                      f'Hello {name},\n\nUse this one-time link to reset your password:\n{reset_url}\n\n'
                      'The link expires in 30 minutes. If you did not request it, you can safely ignore this email.')
