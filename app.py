from flask import Flask, request, render_template, redirect, jsonify
import requests

app = Flask(__name__)
messages = []  # Stores live chat messages

# Replace with your credentials
VERIFY_TOKEN = "verify token"
ACCESS_TOKEN = "EAAJ187mHYNkBO5zaeYPtweKUrlCX1PmRXL6uFhwY7RBf672RDzSaXugYcBLVjPbXxzLDZC5flBllHvp2cZAxJYf85QQWhB2GdqwemQlrjyP72wQ7t8Vtgi61UnkVuJKSHezrxxkfwLGWLM4MmmpW1sgqpVAr1NcnbbtbZABV85cfR1ZAPR2TsZCrHSFHRJhR8oZBShu6pr7PxDdcFc0ZCG4u9UubQsLnWGZADZBaa8xPvzc0GmTqf1yH7kzb9eAZDZD"
PHONE_NUMBER_ID = "724117690777454"

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        number = request.form['number']
        text = request.form['text']
        send_custom_message(number, text)
        return redirect('/')
    return render_template('index.html')

@app.route('/messages')
def get_messages():
    return jsonify(messages)

def get_media_url(media_id):
    url = f"https://graph.facebook.com/v19.0/{media_id}"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}"
    }
    res = requests.get(url, headers=headers)
    if res.status_code == 200:
        return res.json().get("url")
    else:
        print("⚠️ Failed to get media URL:", res.text)
        return "#"

@app.route('/webhook', methods=['GET', 'POST'])
def webhook():
    if request.method == 'GET':
        mode = request.args.get("hub.mode")
        token = request.args.get("hub.verify_token")
        challenge = request.args.get("hub.challenge")
        if mode == "subscribe" and token == VERIFY_TOKEN:
            print("✅ Webhook verified")
            return challenge, 200
        return "❌ Verification failed", 403

    if request.method == 'POST':
        data = request.json
        print("📥 Incoming:", data)

        try:
            value = data['entry'][0]['changes'][0]['value']
            if 'messages' in value:
                message = value['messages'][0]
                sender = message['from']
                msg_type = message.get('type')

                if msg_type == 'text':
                    body = message['text']['body']

                elif msg_type == 'image':
                    media_id = message['image']['id']
                    media_url = get_media_url(media_id)
                    body = f'<img src="{media_url}" alt="Image" width="200"/>'

                elif msg_type == 'audio':
                    body = "[🔊 Audio Received]"

                elif msg_type == 'video':
                    body = "[🎥 Video Received]"

                elif msg_type == 'document':
                    body = "[📄 Document Received]"

                else:
                    body = f"[📦 {msg_type.capitalize()} Received]"

                messages.append({'sender': sender, 'text': body})
                print(f"From {sender}: {body}")

            elif 'statuses' in value:
                for status in value['statuses']:
                    print(f"📬 Message ID {status['id']} → {status['status']}")

        except Exception as e:
            print("⚠️ Error:", e)

        return "EVENT_RECEIVED", 200

def send_custom_message(recipient_number, text):
    url = f"https://graph.facebook.com/v22.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": recipient_number,
        "type": "text",
        "text": {"body": text}
    }
    response = requests.post(url, headers=headers, json=payload)
    print("📤 Sent:", response.status_code, response.text)

    if response.status_code == 200:
        messages.append({'sender': 'Me (You)', 'text': text})


if __name__ == '__main__':
    app.run(port=8080, debug=True)
