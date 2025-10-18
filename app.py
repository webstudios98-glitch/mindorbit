from dotenv import load_dotenv
load_dotenv()
# app.py — Robust AI Mini for MindOrbit
from flask import Flask, render_template, request, jsonify
import os, requests, traceback

# ------------------------------------------------------
# Flask Setup
# ------------------------------------------------------
app = Flask(__name__, template_folder="templates", static_folder="static")

# ------------------------------------------------------
# API Setup — using OpenRouter + DeepSeek
# ------------------------------------------------------
# NOTE: Keep this key only for local testing; remove before deploying publicly.
import os
OPENROUTER_API_KEY =os.getenv("OPENROUTER_API_KEY")

# Base URL for OpenRouter
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_ID = "deepseek/deepseek-chat-v3.1:free"

# ------------------------------------------------------
# ROUTES — HTML Pages
# ------------------------------------------------------
@app.route("/")
def signup():
    """Landing page"""
    return render_template("signup.html")

@app.route("/home")
def home():
    """Home dashboard"""
    return render_template("home.html")

@app.route("/chat", methods=["GET", "POST"])
def chat():
    """
    GET  → shows the chat page
    POST → handles AI chat requests
    """
    if request.method == "GET":
        return render_template("ai_chatbot.html")

    # ---------- POST: Handle chat message ----------
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"reply": "Invalid request (no JSON)."}), 400

    user_message = (data.get("message") or "").strip()
    if not user_message:
        return jsonify({"reply": "Kuch toh bolo yaar! (Say something!)"}), 400

    # ---------- System prompt (controls AI personality) ----------
    system_prompt = (
        "You are 'Robust' — a friendly, wise, bilingual (Hindi + English) AI for the MindOrbit platform. "
        "When user writes in Hindi or Hinglish, start with a short motivational Hindi line "
        "followed by its English translation in brackets, then continue your response in casual Hinglish. "
        "If the user writes in English, respond only in English (no Hindi translation). "
        "Detect mood (sad, stressed, angry, confused, happy, neutral) and adjust tone accordingly: "
        "- Sad/Stressed → supportive, slightly funny, positive vibe. "
        "- Angry → calming, understanding, lightly humorous. "
        "- Confused → clear, simple, encouraging. "
        "- Happy → celebrate and motivate further. "
        "Keep it short (2–6 sentences), warm, natural, slightly witty. "
        "End every message with this tagline: (Try full power mode → Robust App coming soon!)."
    )

    # ---------- Build payload ----------
    payload = {
        "model": MODEL_ID,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.85,
        "max_tokens": 600
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    # ---------- API request ----------
    try:
        resp = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as e:
        print("=== OPENROUTER REQUEST ERROR ===")
        print(traceback.format_exc())
        return jsonify({"reply": "Network issue 😅 Try again soon!"}), 502

    # ---------- Parse AI response ----------
    try:
        j = resp.json()
        content = ""
        if "choices" in j and j["choices"]:
            content = (
                j["choices"][0].get("message", {}).get("content")
                or j["choices"][0].get("text", "")
            )
        if not content:
            content = str(j)[:200]
    except Exception as e:
        print("Parsing OpenRouter response failed:", e)
        return jsonify({"reply": "AI parse error 😕 Try again later."}), 500

    if not content:
        content = "Lagta hai AI so gayi 😴 (AI seems sleepy — try again!)"

    return jsonify({"reply": content})

# ------------------------------------------------------
# OTHER ROUTES (Games, Notes, About, etc.)
# ------------------------------------------------------
@app.route("/moodgame")
def moodgame():
    return render_template("moodgame.html")

@app.route("/badges")
def badges():
    return render_template("badges.html")

@app.route("/noteheart")
def noteheart():
    return render_template("noteheart.html")

@app.route("/feedback")
def feedback():
    return render_template("feedback.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/calmspace")
def calmspace():
    return render_template("calmspace.html")
@app.route("/dotconnect")
def dotconnect():
    return render_template("dotconnect.html")

@app.route("/soothingsound")
def soothingsound():
    # static files like /static/sounds/relax.mp3 will be accessible automatically
    return render_template("soothingsound.html")

@app.route("/breathing")
def breathing():
    return render_template("breathing.html")

@app.route("/littlealchemy")
def littlealchemy():
    return render_template("littlealchemy.html")

@app.route("/painting")
def painting():
    return render_template("painting.html")

@app.route("/quotes")
def quotesoracle():
    return render_template("quotes.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")
    
@app.route('/lexilink')
def lexilink():
    return render_template('lexilink.html')





# ------------------------------------------------------
# RUN SERVER
# ------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
