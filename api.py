import json
import queue
import subprocess
import sys
from datetime import datetime
from flask import Flask, request, jsonify, Response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import Mapped, mapped_column
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///alerts.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

clients = []

class Alert(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    sender: Mapped[str] = mapped_column(db.String(255))
    subject: Mapped[str] = mapped_column(db.String(255))
    confidence: Mapped[float]
    verdict: Mapped[str] = mapped_column(db.String(50))
    intel: Mapped[str] = mapped_column(db.Text)
    urls: Mapped[str] = mapped_column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat() + 'Z',
            'sender': self.sender,
            'subject': self.subject,
            'confidence': self.confidence,
            'verdict': self.verdict,
            'intel': self.intel,
            'urls': self.urls
        }

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(db.String(80), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(db.String(255), nullable=False)

with app.app_context():
    db.create_all()



@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Missing username or password"}), 400
        
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 400
        
    user = User(
        username=data['username'],
        password_hash=generate_password_hash(data['password'])
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"status": "success", "user": {"username": user.username}}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Missing username or password"}), 400
        
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password_hash, data['password']):
        return jsonify({"status": "success", "user": {"username": user.username}}), 200
        
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    alerts = Alert.query.order_by(Alert.timestamp.desc()).limit(50).all()
    return jsonify([a.to_dict() for a in alerts])

@app.route('/api/alerts', methods=['DELETE'])
def clear_alerts():
    db.session.query(Alert).delete()
    db.session.commit()
    return jsonify({"status": "success", "message": "All alerts cleared"}), 200

@app.route('/api/alerts', methods=['POST'])
def add_alert():
    data = request.json
    if not data:
        return jsonify({"error": "No JSON provided"}), 400

    new_alert = Alert(
        sender=data.get('sender', 'Unknown'),
        subject=data.get('subject', 'No Subject'),
        confidence=data.get('confidence', 0.0),
        verdict=data.get('verdict', 'UNKNOWN'),
        intel=data.get('intel', ''),
        urls=data.get('urls', '')
    )
    
    db.session.add(new_alert)
    db.session.commit()

    alert_dict = new_alert.to_dict()
    
    for q in clients:
        q.put(alert_dict)

    return jsonify({"status": "success", "alert": alert_dict}), 201

@app.route('/stream')
def stream():
    def event_stream():
        q = queue.Queue()
        clients.append(q)
        try:
            while True:
                alert_data = q.get()
                yield f"data: {json.dumps(alert_data)}\n\n"
        except GeneratorExit:
            clients.remove(q)

    return Response(event_stream(), mimetype="text/event-stream")

if __name__ == '__main__':
    print("Starting PhishGuard engine...")
    phish_guard_process = subprocess.Popen([sys.executable, "phish_guard.py"])
    
    try:
        app.run(host='0.0.0.0', port=5000, threaded=True)
    finally:
        print("Stopping PhishGuard engine...")
        phish_guard_process.terminate()
