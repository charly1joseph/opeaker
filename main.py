from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import csv
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Set a secret key for session management
app.config['UPLOAD_FOLDER'] = 'static/images'  # Set the upload folder
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max file size

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
        return jsonify({'success': True})
    return jsonify({'success': False})

@app.route('/setup', methods=['GET', 'POST'])
def setup():
    if request.method == 'POST':
        try:
            username = request.form['username'].strip().lower()
            password = request.form['password']
            profile_image = request.files.get('profile_image')

            if not username:
                return jsonify({'success': False, 'message': 'Username cannot be empty'})

            users = read_users()
            if any(user['username'] == username for user in users):
                return jsonify({'success': False, 'message': 'Username already exists'})

            # Save the profile image
            if profile_image:
                if profile_image.filename == '':
                    return jsonify({'success': False, 'message': 'No selected file'})
                if profile_image and allowed_file(profile_image.filename):
                    filename = f"{username}.png"
                    profile_image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                else:
                    return jsonify({'success': False, 'message': 'File type not allowed'})

            # Add the new user to the CSV file
            users.append({'username': username, 'password': password})
            write_users(users)

            session['username'] = username  # Store username in session
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({'success': False, 'message': str(e)})

    return render_template('setup.html')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

@app.route('/main')
def main():
    if 'username' not in session:
        return redirect(url_for('index'))  # Redirect to login if not authenticated
    username = session['username']
    return render_template('main.html', username=username)

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
