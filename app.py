from flask import Flask
import mysql.connector

app = Flask(__name__)

# MySQL Connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="ev_charging_db"
)

@app.route("/")
def home():
    return "EV Charging System - Database Connected Successfully!"

if __name__ == "__main__":
    app.run(debug=True)