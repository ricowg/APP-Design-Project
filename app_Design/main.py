from datetime import datetime
from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    session,
    jsonify,
)
import database_manager as dbHandler

app = Flask(__name__)
app.secret_key = "your_secret_key"


@app.route("/")
def home():
    return redirect(url_for("login"))


@app.route("/signup.html", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        if dbHandler.create_user(username, password):
            flash("Signup successful! Please log in.", "success")
            return redirect(url_for("login"))
        else:
            flash("Username already exists. Please try a different one.", "danger")
    return render_template("signup.html")


@app.route("/login.html", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        if dbHandler.verify_user(username, password):
            session["username"] = username
            flash("Login successful!", "success")
            return redirect(url_for("messages"))
        else:
            flash("Invalid username or password. Please try again.", "danger")
    return render_template("login.html")


@app.route("/messages.html", methods=["GET"])
def messages():
    if "username" not in session:
        flash("Please log in to access this page.", "warning")
        return redirect(url_for("login"))
    return render_template("messages.html", username=session["username"])


@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))


@app.route("/search_users")
def search_users():
    query = request.args.get("query", "").strip()
    if not query:
        print("Search query is empty.")
        return jsonify([])

    try:
        con = dbHandler.sql.connect("database/data_source.db")
        cur = con.cursor()

        cur.execute("SELECT Username FROM user WHERE Username LIKE ?", (f"%{query}%",))
        users = [{"username": row[0]} for row in cur.fetchall()]

        print(f"Search query: {query}")
        print(f"Results: {users}")

        con.close()
        return jsonify(users)
    except Exception as e:
        print(f"Error in search_users: {e}")
        return jsonify({"error": "An error occurred while searching for users."}), 500


@app.route("/send_message", methods=["POST"])
def send_message():
    data = request.json
    receiver_username = data.get("user_id")
    message_text = data.get("message_text")

    if not receiver_username or not message_text:
        return jsonify({"error": "Invalid data"}), 400

    try:
        con = dbHandler.sql.connect("database/data_source.db")
        cur = con.cursor()

        cur.execute(
            "SELECT User_ID FROM user WHERE Username = ?", (session["username"],)
        )
        sender = cur.fetchone()
        cur.execute("SELECT User_ID FROM user WHERE Username = ?", (receiver_username,))
        receiver = cur.fetchone()

        if not sender or not receiver:
            return jsonify({"error": "User not found"}), 404

        sender_id = sender[0]
        receiver_id = receiver[0]

        cur.execute(
            "INSERT INTO messages (Sender_ID, Receiver_ID, Message_Text, Message_Sent_Date) VALUES (?, ?, ?, ?)",
            (sender_id, receiver_id, message_text, datetime.now()),
        )
        con.commit()
        con.close()

        return jsonify({"success": True, "message": "Message sent successfully!"})
    except Exception as e:
        print(f"Error in send_message: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/fetch_messages", methods=["GET"])
def fetch_messages():
    if "username" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    current_user = session["username"]

    selected_user = request.args.get("selected_user", "").strip()

    if not selected_user:
        return jsonify({"error": "No user selected"}), 400

    messages = []
    try:
        con = dbHandler.sql.connect("database/data_source.db")
        cur = con.cursor()

        print(f"Current user: {current_user}")
        print(f"Selected user: {selected_user}")

        cur.execute(
            """
            SELECT 
                (SELECT Username FROM user WHERE User_ID = m.Sender_ID) AS sender,
                m.Message_Text,
                m.Message_Sent_Date
            FROM messages m
            WHERE (m.Sender_ID = (SELECT User_ID FROM user WHERE Username = ?)
                   AND m.Receiver_ID = (SELECT User_ID FROM user WHERE Username = ?))
               OR (m.Sender_ID = (SELECT User_ID FROM user WHERE Username = ?)
                   AND m.Receiver_ID = (SELECT User_ID FROM user WHERE Username = ?))
            ORDER BY m.Message_Sent_Date ASC
            """,
            (current_user, selected_user, selected_user, current_user),
        )

        rows = cur.fetchall()
        print(f"Raw query results: {rows}")

        messages = [{"sender": row[0], "text": row[1], "date": row[2]} for row in rows]
        con.close()

        print(f"Formatted messages: {messages}")
    except Exception as e:
        print(f"Error fetching messages: {e}")
        return jsonify({"error": "Failed to fetch messages"}), 500

    return jsonify({"current_user": current_user, "messages": messages})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5100)
