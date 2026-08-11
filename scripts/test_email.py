import sys
import os
from dotenv import load_dotenv

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from services.email_service import send_email

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_email.py <email_address>")
        sys.exit(1)
        
    recipient = sys.argv[1]
    
    # Load env
    load_dotenv()
    
    print("Testing Email Configuration:")
    print(f"MAIL_HOST: {os.getenv('MAIL_HOST')}")
    print(f"MAIL_PORT: {os.getenv('MAIL_PORT')}")
    # Don't print password/API key
    
    subject = "Campus Cognition - Test Email"
    body = "This is a test email from the Campus Cognition CLI tool to verify SMTP settings."
    
    # Need app context for render_template if we were testing HTML templates, 
    # but send_email supports plain text directly.
    with app.app_context():
        success = send_email(recipient, subject, body_text=body)
        
    if success:
        print(f"\n✅ SUCCESS: Test email sent to {recipient}")
    else:
        print(f"\n❌ FAILED: Could not send email to {recipient}")
        print("Check your .env settings and ensure the app password / API key is correct.")

if __name__ == "__main__":
    main()
