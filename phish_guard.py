import imaplib
import email
import time
import requests
import hashlib
import os
from email.header import decode_header
from transformers import pipeline
import re
from dotenv import load_dotenv

load_dotenv()

EMAIL = os.environ.get("EMAIL", "your_email_address")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "") 
CHECK_INTERVAL = 5 

DASHBOARD_API_URL = "http://localhost:5000/api/alerts"

VT_API_KEY = os.environ.get("VT_API_KEY", "")

MODEL_ID = "Auguzcht/securisense-phishing-detection"

PROCESSED_UIDS = set()

def escape_html_tags(text):
    if not text:
        return ""
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    text = text.replace('"', "&quot;")
    return text

def send_dashboard_alert(sender, subject, confidence, verdict, intel, urls):
    import json
    payload = {
        "sender": sender,
        "subject": subject,
        "confidence": confidence,
        "verdict": verdict,
        "intel": intel,
        "urls": json.dumps(urls)
    }
    try:
        response = requests.post(DASHBOARD_API_URL, json=payload, timeout=5)
        if response.status_code == 201:
            print("Alert successfully pushed to SOC Dashboard!")
            return True
        print(f"Dashboard API returned status code: {response.status_code}")
    except Exception as e:
        print(f"Dashboard alert failed: {e}")
    return False

def query_virustotal(file_hash):
    if not VT_API_KEY or VT_API_KEY == "YOUR_VIRUSTOTAL_API_KEY":
        return "VT Lookup Skipped (No API Key)"
        
    url = f"https://www.virustotal.com/api/v3/files/{file_hash}"
    headers = {"x-apikey": VT_API_KEY}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            stats = data['data']['attributes']['last_analysis_stats']
            malicious = stats['malicious']
            suspicious = stats['suspicious']
            harmless = stats['harmless']
            undetected = stats['undetected']
            
            return f"Flagged Malicious by {malicious} engines (Malicious: {malicious}, Suspicious: {suspicious}, Clean: {harmless + undetected})"
        elif response.status_code == 404:
            return "Hash not found in VirusTotal database (Unknown/Unseen File)"
        else:
            return f"VT Error Code: {response.status_code}"
    except Exception as e:
        return f"VT Query Failed: {e}"

def monitor_local_pipeline():
    global PROCESSED_UIDS
    print("Loading local Transformer Model pipeline into memory...")
    classifier = pipeline("text-classification", model=MODEL_ID)
    print(f"AI Local Monitor Active. Scanning traffic for {EMAIL}...")

    mail = None

    while True:
        try:
            if mail is None:
                mail = imaplib.IMAP4_SSL("imap.gmail.com")
                mail.login(EMAIL, GMAIL_APP_PASSWORD)
            
            mail.select("inbox")
            status, messages = mail.uid('search', None, 'UNSEEN')
            
            if messages[0]:
                uids = messages[0].split()
                active_uids = set(uids)
                PROCESSED_UIDS &= active_uids
                
                for uid in uids:
                    if uid in PROCESSED_UIDS:
                        continue
                        
                    status, data = mail.uid('fetch', uid, '(BODY.PEEK[])')
                    if not data or data[0] is None:
                        continue
                        
                    msg = email.message_from_bytes(data[0][1])
                    
                    raw_subject = msg.get("Subject", "No Subject")
                    decoded_parts = decode_header(raw_subject)
                    subject = "".join([(c.decode(ch or 'utf-8') if isinstance(c, bytes) else c) for c, ch in decoded_parts])
                    sender = msg.get("From", "Unknown Sender")
                    
                    body = ""
                    html_body = ""
                    attachments_found = []
                    
                    if msg.is_multipart():
                        for part in msg.walk():
                            content_type = part.get_content_type()
                            content_disposition = str(part.get("Content-Disposition"))
                            
                            if content_type == "text/plain" and "attachment" not in content_disposition:
                                body += part.get_payload(decode=True).decode(errors='ignore')
                            elif content_type == "text/html" and "attachment" not in content_disposition:
                                html_body += part.get_payload(decode=True).decode(errors='ignore')
                                
                            if "attachment" in content_disposition or part.get_filename():
                                filename = part.get_filename()
                                if filename:
                                    file_data = part.get_payload(decode=True)
                                    if file_data:
                                        sha256_hash = hashlib.sha256(file_data).hexdigest()
                                        attachments_found.append((filename, sha256_hash))
                    else:
                        content_type = msg.get_content_type()
                        decoded_payload = msg.get_payload(decode=True).decode(errors='ignore')
                        if content_type == "text/html":
                            html_body = decoded_payload
                        else:
                            body = decoded_payload

                    eval_text = f"Subject: {subject} | Body: {body if body else html_body}"[:512]
            
                    url_iocs = []
                    raw_urls = []

                    text_url_pattern = r'(?:https?://|www\.)[^\s<>"]+'
                    html_href_pattern = r'href=["\'](https?://[^"\'>\s]+|www\.[^"\'>\s]+)["\']'

                    try:
                        if html_body:
                            raw_urls.extend(re.findall(html_href_pattern, html_body))
                            raw_urls.extend(re.findall(text_url_pattern, html_body))
                        
                        if body:
                            raw_urls.extend(re.findall(text_url_pattern, body))

                        unique_urls = list(dict.fromkeys(raw_urls))

                        for url in unique_urls:
                            safe_url = escape_html_tags(url)
                            defanged_url = safe_url.replace(".", "[.]").replace("://", "[://]").replace("http", "hxxp")
                            url_iocs.append(defanged_url)

                    except Exception as e:
                        print(f"Error extracting URLs: {e}")

                    prediction = classifier(eval_text)[0]
                    
                    verdict = "MALICIOUS/PHISHING" if prediction['label'].lower() == 'phishing' else "SAFE"
                    confidence = round(prediction['score'], 3)
                    
                    vt_reports = []
                    file_triggered_threat = False
                    
                    for fname, fhash in attachments_found:
                        print(f"Processing attachment: {fname} | Hash: {fhash}")
                        vt_verdict = query_virustotal(fhash)
                        
                        safe_fname = escape_html_tags(fname)
                        vt_reports.append(
                            f"<b>File:</b> {safe_fname}\n"
                            f"<b>SHA256:</b> <code>{fhash}</code>\n"
                            f"<b>Intel:</b> {vt_verdict}"
                        )
                        
                        if "Flagged Malicious by" in vt_verdict and not vt_verdict.strip().endswith("by 0 engines"):
                            file_triggered_threat = True

                    if (verdict == "MALICIOUS/PHISHING" and confidence > 0.75) or file_triggered_threat:
                        vt_section = "<br><br>".join(vt_reports) if vt_reports else "None detected"
                        
                        print(f"Threat detected from: {sender}. Quarantining...")
                        
                        # Active Quarantine: Move to Spam
                        try:
                            mail.uid('COPY', uid, '"[Gmail]/Spam"')
                            mail.uid('STORE', uid, '+FLAGS', '(\\Deleted)')
                            mail.expunge()
                            print(f"Successfully moved threat to Spam folder.")
                        except Exception as e:
                            print(f"Failed to quarantine email: {e}")

                        send_dashboard_alert(
                            sender=sender,
                            subject=subject,
                            confidence=confidence,
                            verdict=verdict,
                            intel=vt_section,
                            urls=url_iocs
                        )
                    else:
                        print(f"Verified clean payload from: {sender}")
                    
                    PROCESSED_UIDS.add(uid)
            else:
                mail.noop()
                        
        except Exception as e:
            print(f"Loop Event: {e}")
            if mail:
                try:
                    mail.logout()
                except:
                    pass
                mail = None
            time.sleep(5)
            
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    monitor_local_pipeline()
