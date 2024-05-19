from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import csv
import os
from datetime import datetime
import requests


app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Set a secret key for session management

weather_api_key = '0d63a1c009854d55a80213552241805'

# Map moon phases to icons
MOON_PHASE_ICONS = {
    "New Moon": "🌑",
    "Waxing Crescent": "🌒",
    "First Quarter": "🌓",
    "Waxing Gibbous": "🌔",
    "Full Moon": "🌕",
    "Waning Gibbous": "🌖",
    "Last Quarter": "🌗",
    "Waning Crescent": "🌘"
}

WEATHER_CONDITION_ICONS = {
    "Sunny": "☀️",
    "Clear": "🌕",
    "Partly cloudy": "🌤️",
    "Cloudy": "☁️",
    "Overcast": "☁️",
    "Mist": "🌫️",
    "Patchy rain possible": "🌦️",
    "Patchy snow possible": "🌨️",
    "Patchy sleet possible": "🌨️",
    "Patchy freezing drizzle possible": "🌧️",
    "Thundery outbreaks possible": "⛈️",
    "Blowing snow": "🌨️",
    "Blizzard": "🌨️",
    "Fog": "🌫️",
    "Freezing fog": "🌫️",
    "Patchy light drizzle": "🌦️",
    "Light drizzle": "🌦️",
    "Freezing drizzle": "🌧️",
    "Heavy freezing drizzle": "🌧️",
    "Patchy light rain": "🌧️",
    "Light rain": "🌧️",
    "Moderate rain at times": "🌧️",
    "Moderate rain": "🌧️",
    "Heavy rain at times": "🌧️",
    "Heavy rain": "🌧️",
    "Light freezing rain": "🌧️",
    "Moderate or heavy freezing rain": "🌧️",
    "Light sleet": "🌨️",
    "Moderate or heavy sleet": "🌨️",
    "Patchy light snow": "🌨️",
    "Light snow": "🌨️",
    "Patchy moderate snow": "🌨️",
    "Moderate snow": "🌨️",
    "Patchy heavy snow": "🌨️",
    "Heavy snow": "🌨️",
    "Ice pellets": "🌨️",
    "Light rain shower": "🌦️",
    "Moderate or heavy rain shower": "🌦️",
    "Torrential rain shower": "🌧️",
    "Light sleet showers": "🌨️",
    "Moderate or heavy sleet showers": "🌨️",
    "Light snow showers": "🌨️",
    "Moderate or heavy snow showers": "🌨️",
    "Light showers of ice pellets": "🌨️",
    "Moderate or heavy showers of ice pellets": "🌨️",
    "Patchy light rain with thunder": "⛈️",
    "Moderate or heavy rain with thunder": "⛈️",
    "Patchy light snow with thunder": "🌨️",
    "Moderate or heavy snow with thunder": "🌨️"
}


def get_moon_phase_icon():
    try:  # Replace with your WeatherAPI key
        url = f'https://api.weatherapi.com/v1/astronomy.json?key={weather_api_key}&q=London&dt={datetime.now().strftime("%Y-%m-%d")}'
        response = requests.get(url)
        data = response.json()
        moon_phase = data['astronomy']['astro']['moon_phase']
    except:
        moon_phase = "-"
    return MOON_PHASE_ICONS.get(moon_phase, "🌑")


# Function to get the user's location based on their IP address
def get_user_location():
    response = requests.get('https://ipinfo.io/')
    data = response.json()
    return data['city'], data['region'], data['country']  # City, Region, Country

# Function to get the current weather
def get_current_weather():
    try:
        # city, region, country = get_user_location()
        city = 'shrewsbury'
        url = f'http://api.weatherapi.com/v1/current.json?key={weather_api_key}&q={city}'
        response = requests.get(url)
        data = response.json()
        weather_description = data['current']['condition']['text']
        return WEATHER_CONDITION_ICONS.get(weather_description, "-")
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        return "-"
        
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
    moon_icon = get_moon_phase_icon()
    weather_icon = get_current_weather()

    if 'username' not in session:
        return jsonify({'success': False, 'message': 'User not logged in'})

    username = session['username']
    filename = f'static/journals/{username}_{timestamp.replace("/", "-").replace(":", "_")}.txt'

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'w') as f:
        f.write(f"{moon_icon} {weather_icon} {text}")

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
            timestamp_str = filename[len(username) + 1:-4].replace("-", "/").replace("_", ":").replace(",", "")
            timestamp = datetime.strptime(timestamp_str, '%d/%m/%Y %H:%M:%S')
            with open(os.path.join(folder_path, filename), 'r') as f:
                text = f.read()

                journal_entries.append({'text': text, 'timestamp': timestamp})

    # Sort the journal entries in descending order by timestamp
    journal_entries.sort(key=lambda x: x['timestamp'], reverse=True)

    # Convert timestamps back to strings for display
    for entry in journal_entries:
        text2 = entry['text']
        first_space_index = text2.find(' ')
        second_space_index = text2.find(' ', first_space_index + 1)

        # Extract the substrings
        moon = text2[:first_space_index]
        weather = text2[first_space_index + 1:second_space_index]
        actual_text = text2[second_space_index + 1:]
        entry['text'] = actual_text
        entry['timestamp'] = entry['timestamp'].strftime('%d/%m/%Y %H:%M:%S')
        entry['timestamp'] = f"{moon} {weather} {entry['timestamp']}"

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
