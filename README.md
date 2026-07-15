# Griffin SOC (Security Operations Center)

Griffin SOC is a localized, AI-powered phishing detection and incident response platform. It monitors a target email inbox in real-time, uses Machine Learning to analyze text, queries VirusTotal for malicious attachments, automatically quarantines dangerous emails, and streams the intelligence to a live React dashboard for security analysts.

## Key Features
- **AI Text Classification**: Uses a local Hugging Face Transformer model (`Auguzcht/securisense-phishing-detection`) to classify email bodies as Phishing or Safe.
- **Threat Intelligence**: Automatically extracts file attachments, generates SHA-256 hashes, and queries the VirusTotal API to detect malware.
- **Active Quarantine**: Instantly intercepts threats and issues IMAP commands to move malicious emails out of the Inbox and into the Spam folder before the user can interact with them.
- **Real-Time Dashboard**: A React SPA that consumes Server-Sent Events (SSE) from the backend to render a live incident feed.
- **IoC Extraction**: Uses Regex to extract and "defang" malicious URLs for safe viewing by analysts.

---

## Tech Stack
- **Detection Engine**: Python 3, `imaplib`, `transformers`, `requests`
- **API Server**: Flask, Flask-SQLAlchemy (SQLite), Server-Sent Events
- **Frontend Dashboard**: React 19, Vite, Tailwind CSS v4, TanStack Router
- **Authentication**: `werkzeug.security` (Password hashing)

---

## Setup & Installation

### 1. Prerequisites
- **Python 3.8+**
- **Node.js 18+**
- A Gmail account with an **App Password** generated (Standard passwords will not work).
- A **VirusTotal API Key** (Free tier works).

### 2. Backend Setup
Clone the repository and install the Python dependencies:

```bash
git clone https://github.com/your-username/griffin-soc.git
cd griffin-soc

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

Create a `.env` file in the root of the project with the following credentials:
```env
EMAIL="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-digit-app-password"
VT_API_KEY="your-virustotal-api-key"
```

### 3. Frontend Setup
Navigate into the frontend directory and install the Node modules:

```bash
cd Griffin-Shield
npm install
```

---

## Running the Application

To run the full Griffin SOC environment locally, you will need to open **two separate terminal windows**:

**Terminal 1: Start the Backend (API Server & Detection Engine)**
```bash
python dashboard.py
```
*(This starts the Flask REST API and automatically spawns the `phish_guard.py` detection engine in the background).*

**Terminal 2: Start the React Frontend**
```bash
cd Griffin-Shield
npm run dev
```

Finally, open your browser and navigate to `http://localhost:8080/`. You will be prompted to register an Analyst account before you can view the live feed.

---

## Security Notice
This project stores session states locally and relies on an unencrypted SQLite database. Do not deploy the API to a public cloud environment without implementing proper JWT authentication, CORS restrictions, and SSL/TLS encryption.
