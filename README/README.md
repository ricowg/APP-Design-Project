# APP Design Project

## Project Description and Requirements

### Project Description

A communication platform designed to maximise both its user interface and user experience.

### Project Requirements

| Functional                            | Non-Functional                   |
| --------------------------------------| ---------------------------------|
| Allow users to login and sign up      | Load messages sent under 1 second|
| Allow users to send messages          | Easy to navigate                 |
| Popups displayed for user feedback    | Secure user information          |

## Website Designs

### Inside the Page

<img src="website-design-1.png" alt="website design 1">

### Sign in Page

<img src="website-design-2.png" alt="website design 2">

### Log in Page

<img src="website-design-3.png" alt="website design 3">

## Alternative Designs

### Inside the Page

<img src="alternative design 1.png">

### Sign in Page

<img src="alternative design 2.png">

### Log in Page

<img src="alternative design 3.png">

## Algorithms

### Functional Requirement

Sending Messages

<img src="message_send_algorithm.png">

### Test Case 1

Test Case ID: TC001

Test Case Name: Successful Message Sent

Preconditions: User is logged in, internet connection active

Test Steps:

    1. User selects another user
    2. User types "hello"
    3. Checks if user is logged in 
    4. Mark as "Sending" in chat
    5. Delivers message to the other user
    6. Message status changes to "Sent"

Expected Result: Message delivered and received successfully, message status shows as "Sent"

Priority: High

### Test Case 2

Test Case ID: TC002

Test Case Name: Unsuccessful Message Sent

Preconditions: User is not logged in, internet connection active

Test Steps:

    1. User selects another user
    2. User types "hello"
    3. Checks if user is logged in
    4. Show error message due to permissions not being granted

Expected Result: Error message is displayed: "Please log in." Message is not sent or shown in chat.

Priority: High

## Database Structure and Test Data

### User

<img src="user_database.png">

### Messages

<img src="messages_database.png">

### SQL Queries Examples

1. `SELECT * FROM messages WHERE Message_ID = 1;`

2. `SELECT * FROM messages WHERE Sender_ID is 1;`

3. `SELECT * FROM messages WHERE Receiver_ID is 1;`

4. `SELECT * FROM messages WHERE Message_Text='Digitized';`

5. `SELECT * FROM user WHERE Username='mspringtorp1a';`

## Web App Prototypes

### Prototype 1
As of Week 9

#### Login Page

<img src="login_prototype1.png">

#### Sign Up Page

<img src="signup_prototype1.png">

#### Messages Page

<img src="messageui_prototype1.png">

### Prototype 2
As of Week 10

#### Login Page

<img src="login2.png">

#### Sign Up Page

<img src="signup2.png">

#### Messages Page

<img src="messages2.png">

## Lighthouse Reports

### Report #1

<img src="lighthouse_report_1.png">

### Report #2

Changed image format from png to avif. Ran test without chrome extensions.

<img src="lighthouse_report_2.png">

## Adding Interactivity

### Login and Signup Functionality

#### Features:
- **Signup**: Users create an account through a unique username and password
- **Login**: Users can login through a registered account
- **Validation**: System validates information provided by user
- **Password Security**: Passwords are hashed using `werkzeug.security` for security

#### How It Works

##### Signup Process:
1. The user enters a unique username and password on the signup page.
2. The system checks if the username already exists in the database.
3. If the username is unique:
   - The password is hashed and stored in the database.
   - The user is redirected to the login page with a success message.
4. If the username already exists:
   - The user is shown an error message.

##### Login Process:
1. The user enters their username and password on the login page.
2. The system checks if the username exists in the database.
3. If the username exists:
   - The entered password is compared with the hashed password stored in the database.
   - If the password matches, the user is logged in and redirected to the messaging page.
   - If the password does not match, an error message is shown.
4. If the username does not exist:
   - An error message is shown.

#### Important Code Examples

##### Signup Route (`main.py`)

```
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
```

##### Login Route (`main.py`)

```
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
```
#### Database Schema

The following information is then stored in the `user` table:

| Column Name             |Data Type| Description                     |
|-------------------------|---------|---------------------------------|
| `User_ID`               | INTEGER | Auto-incrementing primary key.  |
| `Username`              | TEXT    | Unique username.                |
| `Password`              | TEXT    | Hashed password.                |
| `Account_Creation_Date` | DATE    | Account creation date.          |

### Messaging Functionality

#### Features:
- **User-to-User Messaging**: Users can send messages to other registered users.
- **Display**: Messages are displayed in a chatbox interface that distinguishes between sent and received messages and the sender and receiver
- **Message History**: Users can view the history of messages exchanged with another user.
- **Real Time Updates**: Messages are updated in the chatbox after being sent.
- **Message Storing**: Messages are stored in the 'messages' database to allow messages to stay and update when the page refreshes

#### How It Works

##### Sending Messages
1. The user selects a recipient by searching for their username in the search bar.
2. The user types a message in the input box and clicks the 'Send' button or presses 'Enter'.
3. The system retrieves the Sender_ID and Receiver_ID from the database.
4. The message, along with the sender, receiver, and timestamp, is stored in the messages table in the database.
5. The chat box is updated to show newly sent messages, along with the past chat history.

#### Important Code Examples

##### Sending Messages Route (`main.py`)

```
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
```

##### Searching for Users Route (`main.py`)

```
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
```
#### Database Schema

The following information is then stored in the `user` table:

| Column Name         |Data Type | Description                               |
|---------------------|----------|-------------------------------------------|
| `Message_ID`        | INTEGER  | Auto-incrementing primary key.            |
| `Sender_ID`         | INTEGER  | User_ID of user who sent the message.     |
| `Receiver_ID`       | INTEGER  | User_ID of user who received the message. |
| `Message_Text`      | TEXT     | Content of the message.                   |
| `Message_Sent_Date` | DATETIME | Timestamp when the message was sent.      |