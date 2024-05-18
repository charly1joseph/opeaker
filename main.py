from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import csv
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Set a secret key for session management

# Path to the users CSV file
USERS_CSV = 'users.csv'

# Function to read users from the CSV file
def read_users():
    if not os.path.exists(USERS_CSV):
        return []
    with open(USERS_CSV, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        return list(reader)

# Function to write users to the CSV file
def write_users(users):
    with open(USERS_CSV, 'w', newline='') as csvfile:
        fieldnames = ['username', 'password']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(users)

@app.route('/')
def index():
    if 'username' in session:
        return redirect(url_for('main'))
    return render_template('index.html')

@app.route('/check_user', methods=['GET'])
def check_user():
    username = request.args.get('username')
    users = read_users()
    user_exists = any(user['username'] == username for user in users)
    return jsonify({'exists': user_exists})

@app.route('/login_user', methods=['POST'])
def login_user():
    data = request.get_json()
    username = data['username']
    password = data['password']
    users = read_users()
    user = next((user for user in users if user['username'] == username), None)
    if user and user['password'] == password:
        session['username'] = username  # Store username in session
        session['new_user'] = False  # Indicate that the user is not new
        return jsonify({'success': True})
    return jsonify({'success': False})

@app.route('/setup', methods=['GET', 'POST'])
def setup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        profile_image = request.files.get('profile_image')

        # Validate username

        users = read_users()
        if any(user['username'] == username for user in users):
            return jsonify({'success': False, 'message': 'Username already exists.'})

        users.append({'username': username, 'password': password})
        write_users(users)

        if profile_image:
            profile_image.save(os.path.join('static/images', f'{username}.png'))

        session['username'] = username  # Store username in session
        session['new_user'] = True  # Indicate that the user is new
        return jsonify({'success': True})

    username = request.args.get('username', '')
    return render_template('setup.html', username=username)

@app.route('/save_journal_entry', methods=['POST'])
def save_journal_entry():
    data = request.get_json()
    text = data['text']
    timestamp = data['timestamp']

    if 'username' not in session:
        return jsonify({'success': False, 'message': 'User not logged in'})

    username = session['username']
    filename = f'static/journals/{username}_{timestamp.replace("/", "-").replace(":", "-")}.txt'

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'w') as f:
        f.write(text)

    return jsonify({'success': True})

@app.route('/get_journal_entries', methods=['GET'])
def get_journal_entries():
    if 'username' not in session:
        return jsonify({'success': False, 'message': 'User not logged in'})

    username = session['username']
    journal_entries = []

    folder_path = 'static/journals'
    for filename in os.listdir(folder_path):
        if filename.startswith(f"{username}_"):
            timestamp = filename[len(username) + 1:-4].replace("-", "/")
            with open(os.path.join(folder_path, filename), 'r') as f:
                text = f.read()
                journal_entries.append({'text': text, 'timestamp': timestamp})

    return jsonify({'success': True, 'entries': journal_entries})
@app.route('/main')
def main():
    if 'username' not in session:
        return redirect(url_for('index'))  # Redirect to login if not authenticated
    username = session['username']
    new_user = session.get('new_user', False)
    return render_template('main.html', username=username, new_user=new_user)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
