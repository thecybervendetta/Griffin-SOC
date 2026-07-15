import smtplib
from email.message import EmailMessage
from string import Template

sender = "richieeacey@gmail.com"
password = "befa kswp ukau rcih"
recipient = "richardovensehi@gmail.com"


def send_email(template, FirstName):
    msg = EmailMessage()
    msg['Subject'] = "Urgent Action Required"
    msg['From'] = sender
    msg['To'] = recipient

    msg.set_content("Null")


    with open(template, 'r', encoding="utf-8") as file:
        html_template = Template(file.read())

    html_body = html_template.substitute(
        FirstName=FirstName 
    )

    msg.add_alternative(html_body, subtype='html')

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(sender, password)
        smtp.send_message(msg)

    print("Email sent successfully")

    
if __name__ == "__main__":
    send_email("amazon-web-services-aws-aws-account-verification-request-modified.html", "Richard")
