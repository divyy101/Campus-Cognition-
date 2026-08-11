"""
Production-ready Email Service for Campus Cognition V2.
Supports SMTP and API-key based providers.
Sends multi-part HTML and plain-text emails.
"""
import os
import smtplib
from email.message import EmailMessage
import logging
from flask import render_template, current_app

logger = logging.getLogger(__name__)

def _get_email_config():
    """Retrieve and normalize email configuration from environment variables."""
    host = os.getenv('MAIL_HOST', '').strip()
    port = int(os.getenv('MAIL_PORT', '587'))
    username = os.getenv('MAIL_USERNAME', '').strip()
    password = os.getenv('MAIL_PASSWORD', '')
    api_key = os.getenv('MAIL_API_KEY', '').strip()
    
    # Use API key as password for API-based SMTP providers (e.g., SendGrid, Mailgun)
    if api_key and not password:
        password = api_key
        if not username:
            username = 'apikey' # Default for many providers
            
    from_email = os.getenv('MAIL_FROM', '').strip()
    from_name = os.getenv('MAIL_FROM_NAME', 'Campus Cognition').strip()
    use_tls = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
    
    sender = f"{from_name} <{from_email}>" if from_name else from_email
    
    return {
        'host': host,
        'port': port,
        'username': username,
        'password': password,
        'sender': sender,
        'from_email': from_email,
        'use_tls': use_tls
    }

def send_email(recipient: str, subject: str, body_text: str, body_html: str = None) -> bool:
    """Send an email using configured provider with safe failure."""
    config = _get_email_config()
    
    if not config['host'] or not config['from_email']:
        logger.warning('Email not sent: MAIL_HOST and MAIL_FROM are not configured.')
        return False
        
    message = EmailMessage()
    message['Subject'] = subject
    message['From'] = config['sender']
    message['To'] = recipient
    
    # Set plaintext body
    message.set_content(body_text)
    
    # Add HTML alternative if provided
    if body_html:
        message.add_alternative(body_html, subtype='html')
        
    try:
        # A mail provider outage must not leave the auth pages loading indefinitely
        # Use a short timeout to fail fast.
        with smtplib.SMTP(config['host'], config['port'], timeout=10) as server:
            if config['use_tls']:
                server.starttls()
            if config['username'] and config['password']:
                server.login(config['username'], config['password'])
            server.send_message(message)
        logger.info(f"Email sent successfully to {recipient}")
        return True
    except (OSError, smtplib.SMTPException) as error:
        logger.error(f"Email delivery failed: {error.__class__.__name__}")
        # Never log actual credentials or the exact recipient in full detail for security
        return False

def send_welcome_email(user: dict) -> bool:
    """Send welcome email to a newly registered user."""
    name = user.get('first_name') or user.get('username')
    email = user.get('email')
    
    subject = "Welcome to Campus Cognition 🎓"
    
    # Text fallback
    body_text = f"""Hello {name},

Welcome to Campus Cognition.
Your account has been successfully created.

Registered email: {email}

You can now use Campus Cognition to:
• Analyze your syllabus and PYQs
• Build personalized study roadmaps
• Ask questions about your notes
• Review and optimize code
• Discover internships and scholarships
• Track career opportunities
• Use Campus AI

For security, your password is never stored or sent by email.

Regards,
Campus Cognition Team
"""
    
    body_html = None
    try:
        if current_app:
            body_html = render_template('emails/welcome.html', name=name, email=email)
    except Exception as e:
        logger.warning(f"Could not render HTML template for welcome email: {e}")
        
    return send_email(email, subject, body_text, body_html)

def send_password_reset_email(user: dict, reset_url: str) -> bool:
    """Send a secure password reset link."""
    name = user.get('first_name') or user.get('username')
    email = user.get('email')
    
    subject = "Reset your Campus Cognition password"
    
    body_text = f"""Hello {name},

We received a request to reset your Campus Cognition password.

Use this one-time link to create a new password:
{reset_url}

This link expires in 30 minutes and can only be used once.

If you did not request this reset, you can safely ignore this email.
For security, Campus Cognition never sends your existing password by email.

Regards,
Campus Cognition Team
"""
    
    body_html = None
    try:
        if current_app:
            body_html = render_template('emails/password_reset.html', name=name, reset_url=reset_url)
    except Exception as e:
        logger.warning(f"Could not render HTML template for password reset email: {e}")

    return send_email(email, subject, body_text, body_html)

def send_password_changed_email(user: dict) -> bool:
    """Notify user that their password was changed."""
    name = user.get('first_name') or user.get('username')
    email = user.get('email')
    
    subject = "Your Campus Cognition password was changed"
    
    body_text = f"""Hello {name},

Your Campus Cognition password was successfully changed.

If you did not make this change, please contact support immediately.

Regards,
Campus Cognition Team
"""
    
    body_html = None
    try:
        if current_app:
            body_html = render_template('emails/password_changed.html', name=name)
    except Exception as e:
        logger.warning(f"Could not render HTML template for password changed email: {e}")

    return send_email(email, subject, body_text, body_html)

def send_application_deadline_email(user: dict, opportunity: dict) -> bool:
    """Notify user of an upcoming application deadline."""
    name = user.get('first_name') or user.get('username')
    email = user.get('email')
    
    subject = f"Deadline Approaching: {opportunity.get('title')}"
    
    body_text = f"""Hello {name},

This is a reminder that the application deadline for '{opportunity.get('title')}' at {opportunity.get('company', 'Organization')} is approaching on {opportunity.get('deadline')}.

Don't forget to submit your application!

Regards,
Campus Cognition Team
"""
    
    body_html = None
    try:
        if current_app:
            body_html = render_template('emails/application_deadline.html', name=name, opportunity=opportunity)
    except Exception as e:
        logger.warning(f"Could not render HTML template for deadline email: {e}")

    return send_email(email, subject, body_text, body_html)

def send_notification_email(user: dict, subject: str, message: str) -> bool:
    """Send a generic notification email."""
    name = user.get('first_name') or user.get('username')
    email = user.get('email')
    
    body_text = f"""Hello {name},

{message}

Regards,
Campus Cognition Team
"""
    
    body_html = None
    try:
        if current_app:
            body_html = render_template('emails/notification.html', name=name, message=message)
    except Exception as e:
        logger.warning(f"Could not render HTML template for notification email: {e}")

    return send_email(email, subject, body_text, body_html)
