const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "static")));

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "ev_charging_db"
});

// Connect MySQL
db.connect((err) => {
    if (err) {
        console.log("MySQL Connection Failed:", err);
        return;
    }
    console.log("MySQL Connected Successfully");
});

// ================= HOME =================

app.get("/", (req, res) => {
    res.redirect("/login");
});

// ================= REGISTER PAGE =================

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "templates", "register.html"));
});

// ================= REGISTER =================

app.post("/register", (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        return res.send("All fields are required. <a href='/register'>Go Back</a>");
    }

    const userName = name.trim();
    const userEmail = email.trim().toLowerCase();
    const userPhone = phone.trim();
    const userPassword = password.trim();

    if (!/^[0-9]{10}$/.test(userPhone)) {
        return res.send("Invalid mobile number. <a href='/register'>Try Again</a>");
    }

    // Check duplicate email
    const checkSql = "SELECT email FROM users WHERE email = ?";

    db.query(checkSql, [userEmail], (err, rows) => {
        if (err) {
            console.log(err);
            return res.send("Database error. Please try again.");
        }

        if (rows.length > 0) {
            return res.send(`
                <h2>Email Already Registered</h2>
                <a href="/register">Register with another email</a><br>
                <a href="/login">Login</a>
            `);
        }

        // Insert user
        const insertSql = `
            INSERT INTO users (name, email, phone, password)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            insertSql,
            [userName, userEmail, userPhone, userPassword],
            (err, result) => {
                if (err) {
                    console.log(err);
                    return res.send("Registration failed. Please try again.");
                }

                console.log("User registered. ID:", result.insertId);

res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Registration Successful</title>
        <style>
            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: Arial, sans-serif;
                background:
                    radial-gradient(circle at top left, #164e8a, transparent 45%),
                    radial-gradient(circle at bottom right, #6b21a8, transparent 45%),
                    linear-gradient(135deg, #07152e, #0b2545, #101b3c);
            }

            .success-box {
                width: 90%;
                max-width: 470px;
                padding: 45px 35px;
                text-align: center;
                border-radius: 25px;
                background: rgba(255, 255, 255, 0.09);
                border: 1px solid rgba(0, 212, 255, 0.4);
                box-shadow: 0 15px 45px rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(15px);
            }

            .icon {
                width: 90px;
                height: 90px;
                line-height: 90px;
                margin: 0 auto 20px;
                border-radius: 50%;
                font-size: 48px;
                background: linear-gradient(135deg, #00d4ff, #7c3aed);
                box-shadow: 0 0 25px rgba(0, 212, 255, 0.35);
            }

            h2 {
                color: #ffffff;
                font-size: 27px;
                margin-bottom: 15px;
            }

            p {
                color: #cbdff5;
                font-size: 16px;
                line-height: 1.7;
                margin-bottom: 30px;
            }

            a {
                display: inline-block;
                padding: 14px 35px;
                border-radius: 30px;
                background: linear-gradient(135deg, #00c6ff, #0072ff);
                color: white;
                text-decoration: none;
                font-weight: bold;
                box-shadow: 0 5px 20px rgba(0, 198, 255, 0.3);
                transition: 0.3s;
            }

            a:hover {
                background: linear-gradient(135deg, #7c3aed, #00c6ff);
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(0, 198, 255, 0.45);
            }
        </style>
    </head>

    <body>
        <div class="success-box">
            <div class="icon">⚡</div>
            <h2>Registration Successful!</h2>
            <p>
                Your account has been created successfully.
                Welcome to Smart City EV Charging Network!
            </p>
            <a href="/login">Login Now</a>
        </div>
    </body>
    </html>
`);
            }
        );
    });
});

// ================= LOGIN PAGE =================

app.get("/login", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Smart EV | Login</title>

            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: Arial, sans-serif;
                }

                body {
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background:
                        radial-gradient(circle at 15% 20%,
                            rgba(0, 229, 255, 0.18), transparent 35%),
                        radial-gradient(circle at 85% 80%,
                            rgba(150, 50, 255, 0.22), transparent 35%),
                        linear-gradient(135deg, #07152f, #101d43);
                    color: white;
                }

                .container {
                    width: 900px;
                    max-width: 95%;
                    min-height: 570px;
                    display: flex;
                    overflow: hidden;
                    border-radius: 28px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(18px);
                }

                .left {
                    width: 50%;
                    padding: 55px 40px;
                    background: linear-gradient(
                        145deg,
                        rgba(0, 229, 255, 0.13),
                        rgba(120, 70, 255, 0.15)
                    );
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .left h1 {
                    font-size: 38px;
                    margin-bottom: 20px;
                    color: #00e5ff;
                }

                .left p {
                    color: #d8e6ff;
                    line-height: 1.7;
                    margin-bottom: 25px;
                }

                .features {
                    line-height: 2.8;
                    color: #e5f5ff;
                }

                .right {
                    width: 50%;
                    padding: 55px 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .right h2 {
                    font-size: 30px;
                    margin-bottom: 12px;
                    color: white;
                }

                .subtitle {
                    color: #b9c8e8;
                    margin-bottom: 30px;
                }

                input {
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.2);
                    outline: none;
                    background: rgba(255,255,255,0.08);
                    color: white;
                    font-size: 15px;
                }

                input::placeholder {
                    color: #b9c8e8;
                }

                input:focus {
                    border-color: #00e5ff;
                    box-shadow: 0 0 10px rgba(0,229,255,0.25);
                }

                button {
                    width: 100%;
                    padding: 15px;
                    border: none;
                    border-radius: 10px;
                    background: linear-gradient(90deg, #00e5ff, #7c4dff);
                    color: #07152f;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: 0.3s;
                }

                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,229,255,0.25);
                }

                .register-link {
                    text-align: center;
                    margin-top: 25px;
                    color: #c7d6f5;
                }

                .register-link a {
                    color: #00e5ff;
                    text-decoration: none;
                    font-weight: bold;
                }

                @media (max-width: 700px) {
                    .container {
                        flex-direction: column;
                    }

                    .left, .right {
                        width: 100%;
                        padding: 35px 25px;
                    }

                    .left {
                        min-height: 250px;
                    }
                }
            </style>
        </head>

        <body>
            <div class="container">

                <div class="left">
                    <h1>⚡ Smart EV</h1>
                    <p>
                        Welcome back to Smart City EV Charging Network.
                        Login to continue your EV charging journey.
                    </p>

                    <div class="features">
                        <div>⚡ Fast EV Charging</div>
                        <div>📍 Find Nearby Stations</div>
                        <div>🔐 Secure User Account</div>
                        <div>🔋 Easy Charging Booking</div>
                    </div>
                </div>

                <div class="right">
                    <h2>Welcome Back!</h2>
                    <p class="subtitle">Login to your account</p>

                    <form action="/login" method="POST">
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            required
                        >

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            required
                        >

                        <button type="submit">Login</button>
                    </form>

                    <div class="register-link">
                        Don't have an account?
                        <a href="/register">Create Account</a>
                    </div>
                </div>

            </div>
        </body>
        </html>
    `);
});

// ================= LOGIN CHECK =================

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email.trim().toLowerCase()], (err, result) => {
        if (err) {
            console.log("Login Error:", err);
            return res.status(500).send("Database error");
        }

        if (result.length === 0 || result[0].password !== password) {
            return res.send(`
                <h2>Invalid Email or Password</h2>
                <a href="/login">Try Again</a>
            `);
        }

        res.redirect("/dashboard");
    });
});


// ================= DASHBOARD ROUTE =================

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "templates", "dashboard.html"));
});
// BOOK SLOT - GET route
app.get("/booking", (req, res) => {
    res.sendFile(
        path.join(__dirname, "templates", "booking.html")
    );
});

// BOOK SLOT - POST route
app.post("/booking", (req, res) => {
    const {
        fullname,
        vehicle_number,
        station,
        booking_date,
        booking_time
    } = req.body;

    if (
        !fullname ||
        !vehicle_number ||
        !station ||
        !booking_date ||
        !booking_time
    ) {
        return res.status(400).send("Please fill all fields.");
    }

    const sql = `
        INSERT INTO bookings
        (fullname, vehicle_number, station, booking_date, booking_time)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [fullname, vehicle_number, station, booking_date, booking_time],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Booking failed.");
            }

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Booking Successful | Smart EV</title>

                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                            font-family: Arial, sans-serif;
                        }

                        body {
                            min-height: 100vh;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            padding: 20px;
                            background:
                                radial-gradient(circle at 15% 20%, rgba(0,229,255,0.25), transparent 35%),
                                radial-gradient(circle at 85% 80%, rgba(180,60,255,0.25), transparent 35%),
                                linear-gradient(135deg, #07152f, #123b69, #3b1b72);
                            color: white;
                        }

                        .card {
                            width: 100%;
                            max-width: 520px;
                            padding: 45px 30px;
                            text-align: center;
                            border-radius: 25px;
                            background: rgba(255,255,255,0.10);
                            border: 1px solid rgba(255,255,255,0.25);
                            box-shadow: 0 20px 60px rgba(0,0,0,0.35);
                        }

                        .icon {
                            font-size: 65px;
                            margin-bottom: 20px;
                        }

                        h1 {
                            color: #65f5bd;
                            font-size: 30px;
                            margin-bottom: 18px;
                        }

                        p {
                            color: #e0f2fe;
                            line-height: 1.7;
                            margin-bottom: 12px;
                        }

                        .booking-info {
                            margin: 25px 0;
                            padding: 18px;
                            border-radius: 15px;
                            background: rgba(0,0,0,0.18);
                            line-height: 1.9;
                            overflow-wrap: anywhere;
                        }

                        a {
                            display: inline-block;
                            margin-top: 15px;
                            padding: 13px 28px;
                            border-radius: 30px;
                            text-decoration: none;
                            font-weight: bold;
                            color: #07152f;
                            background: linear-gradient(90deg, #00e5ff, #65f5bd);
                        }

                        a:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 8px 20px rgba(0,229,255,0.3);
                        }
                    </style>
                </head>

                <body>
                    <div class="card">
                        <div class="icon"></div>
                        <h1>Booking Successful!</h1>
                        <p>Your EV charging slot has been booked successfully.</p>

                        <div class="booking-info">
                            <p>⚡ Your booking is confirmed.</p>
                            <p>📅 Date: ${booking_date}</p>
                            <p>⏰ Time: ${booking_time}</p>
                        </div>

                        <p>Thank you for choosing Smart City EV Charging Network.</p>
                        <a href="/dashboard">Back to Dashboard</a>
                    </div>
                </body>
                </html>
            `);
        }
    );
});
// PAYMENT - GET route
app.get("/payment", (req, res) => {
    res.sendFile(
        path.join(__dirname, "templates", "payment.html")
    );
});

// PAYMENT - POST route
app.post("/payment", (req, res) => {
    const { method } = req.body;

    if (!method) {
        return res.status(400).send("Please select a payment method.");
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Status</title>
        </head>
        <body>
            <h2>Payment Demo</h2>
            <p>Selected method: ${method}</p>
            <p>This is a demo. No real payment was made.</p>
            <a href="/dashboard">Back to Dashboard</a>
        </body>
        </html>
    `);
});

// BATTERY STATUS - GET route
app.get("/battery", (req, res) => {
    res.sendFile(
        path.join(__dirname, "templates", "battery.html")
    );
});

// BATTERY STATUS - POST route
app.post("/battery", (req, res) => {
    const { battery_level } = req.body;

    if (
        battery_level === undefined ||
        battery_level === "" ||
        Number.isNaN(Number(battery_level)) ||
        Number(battery_level) < 0 ||
        Number(battery_level) > 100
    ) {
        return res.status(400).send("Enter battery level between 0 and 100.");
    }

    const level = Number(battery_level);

    let status = "Good";

    if (level <= 20) {
        status = "Low Battery - Please Charge";
    } else if (level <= 50) {
        status = "Medium Battery";
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Battery Status</title>
        </head>
        <body>
            <h2>Battery Status</h2>
            <p>Battery Level: ${level}%</p>
            <p>Status: ${status}</p>
            <a href="/battery">Back</a>
            <br><br>
            <a href="/dashboard">Dashboard</a>
        </body>
        </html>
    `);
});

// ================= STATIONS PAGE =================

app.get("/stations", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "templates",
            "stations.html"
        )
    );

});

// ================= MY BOOKINGS PAGE =================

app.get("/bookings", (req, res) => {

    const sql =
        "SELECT * FROM bookings ORDER BY booking_id DESC";

    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.log(
                    "Fetch Booking Error:",
                    err
                );

                return res
                    .status(500)
                    .send("Unable to fetch bookings");
            }

            let html = `
<!DOCTYPE html>

<html>

<head>

    <title>My Bookings | Smart EV</title>

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <style>

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: Arial, sans-serif;

            min-height: 100vh;

            background:
            linear-gradient(
                135deg,
                #06152e,
                #0b2d4f,
                #063b5c
            );

            color: #ffffff;
        }

        /* HEADER */

        .header {

            background:
            rgba(4, 18, 38, 0.95);

            padding: 22px 7%;

            display: flex;

            justify-content: space-between;

            align-items: center;

            border-bottom:
            1px solid rgba(0, 229, 255, 0.25);

            box-shadow:
            0 4px 20px
            rgba(0, 229, 255, 0.12);
        }

        .logo {

            font-size: 24px;

            font-weight: bold;

            color: #00e5ff;
        }

        .logo span {

            color: #ffab00;
        }

        .dashboard-btn {

            text-decoration: none;

            background:
            linear-gradient(
                135deg,
                #00bcd4,
                #0077b6
            );

            color: white;

            padding: 11px 20px;

            border-radius: 25px;

            font-weight: bold;
        }

        .dashboard-btn:hover {

            box-shadow:
            0 0 18px
            rgba(0,229,255,0.5);
        }

        /* MAIN */

        .container {

            width: 90%;

            max-width: 1250px;

            margin: 45px auto;
        }

        .title-section h1 {

            font-size: 38px;

            color: #ffffff;
        }

        .title-section p {

            margin-top: 10px;

            color: #a9d6e5;
        }

        /* BOOKING CARD */

        .booking-card {

            background:
            linear-gradient(
                145deg,
                #102f4d,
                #0a223d
            );

            border:
            1px solid
            rgba(0,229,255,0.25);

            border-left:
            5px solid #00e5ff;

            border-radius: 20px;

            padding: 25px;

            margin-top: 25px;

            box-shadow:
            0 8px 30px
            rgba(0,0,0,0.35);

            transition: 0.3s;
        }

        .booking-card:hover {

            transform:
            translateY(-5px);

            border-color:
            #00e5ff;

            box-shadow:
            0 0 25px
            rgba(0,229,255,0.25);
        }

        /* TOP */

        .card-top {

            display: flex;

            justify-content:
            space-between;

            align-items: center;

            margin-bottom: 22px;
        }

        .booking-id {

            color: #00e5ff;

            font-size: 18px;

            font-weight: bold;
        }

        .status {

            background:
            rgba(76, 255, 145, 0.12);

            color: #4cff91;

            border:
            1px solid #4cff91;

            padding: 7px 15px;

            border-radius: 20px;

            font-size: 13px;

            font-weight: bold;
        }

        /* DETAILS */

        .details {

            display: grid;

            grid-template-columns:
            repeat(5, 1fr);

            gap: 15px;
        }

        .detail {

            background:
            rgba(0, 0, 0, 0.20);

            border:
            1px solid
            rgba(255,255,255,0.08);

            padding: 16px;

            border-radius: 13px;
        }

        .label {

            font-size: 11px;

            color: #7fc8dc;

            margin-bottom: 8px;
        }

        .value {

            font-size: 14px;

            font-weight: bold;

            color: #ffffff;
        }

        /* EMPTY */

        .empty {

            background: #0d2945;

            border:
            1px solid
            rgba(0,229,255,0.25);

            padding: 60px;

            text-align: center;

            border-radius: 20px;

            margin-top: 30px;
        }

        .empty-icon {

            font-size: 55px;

            margin-bottom: 15px;
        }

        /* FOOTER */

        .footer {

            text-align: center;

            padding: 30px;

            color: #78b8ca;

            font-size: 13px;
        }

        /* MOBILE */

        @media(max-width: 900px) {

            .details {

                grid-template-columns:
                repeat(2, 1fr);
            }

        }

        @media(max-width: 550px) {

            .details {

                grid-template-columns: 1fr;
            }

            .card-top {

                flex-direction: column;

                align-items: flex-start;

                gap: 12px;
            }

        }

    </style>

</head>

<body>

    <header class="header">

        <div class="logo">
            ⚡ Smart<span>EV</span>
        </div>

        <a
            href="/dashboard"
            class="dashboard-btn"
        >
            ← Dashboard
        </a>

    </header>

    <div class="container">

        <div class="title-section">

            <h1>
                My Bookings ⚡
            </h1>

            <p>
                Manage and view your EV charging reservations
            </p>

        </div>
`;

            if (results.length === 0) {

                html += `

                <div class="empty">

                    <div class="empty-icon">
                        🔋
                    </div>

                    <h2>
                        No Bookings Yet
                    </h2>

                    <p
                        style="
                        margin-top:10px;
                        color:#718096;
                        "
                    >
                        You haven't booked an EV
                        charging slot yet.
                    </p>

                </div>

                `;

            } else {

                results.forEach(
                    booking => {

                        html += `

                        <div class="booking-card">

                            <div class="card-top">

                                <div class="booking-id">

                                    ⚡ Booking
                                    #${booking.booking_id}

                                </div>

                                <div class="status">

                                    ✓ ${booking.status}

                                </div>

                            </div>

                            <div class="details">

                                <div class="detail">

                                    <div class="label">
                                        CUSTOMER
                                    </div>

                                    <div class="value">
                                        👤 ${booking.fullname}
                                    </div>

                                </div>

                                <div class="detail">

                                    <div class="label">
                                        VEHICLE
                                    </div>

                                    <div class="value">
                                        🚗 ${booking.vehicle_number}
                                    </div>

                                </div>

                                <div class="detail">

                                    <div class="label">
                                        CHARGING STATION
                                    </div>

                                    <div class="value">
                                        📍 ${booking.station}
                                    </div>

                                </div>

                                <div class="detail">

                                    <div class="label">
                                        DATE
                                    </div>

                                    <div class="value">
                                        📅 ${booking.booking_date}
                                    </div>

                                </div>

                                <div class="detail">

                                    <div class="label">
                                        CHARGING TIME
                                    </div>

                                    <div class="value">
                                        ⏰ ${booking.booking_time}
                                    </div>

                                </div>

                            </div>

                        </div>

                        `;
                    }
                );
            }

            html += `

    </div>

    <div class="footer">

        ⚡ Smart EV Charging Network
        <br>
        Smart • Fast • Green

    </div>

</body>

</html>
`;

            res.send(html);

        }
    );
});
// ================= PROFILE PAGE =================

app.get("/profile", (req, res) => {

    res.send(`
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>My Profile | Smart EV</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:"Segoe UI",Arial,sans-serif;
}

body{

    min-height:100vh;

    color:white;

    background:
        radial-gradient(
            circle at 10% 10%,
            rgba(0,229,255,.18),
            transparent 28%
        ),

        radial-gradient(
            circle at 90% 80%,
            rgba(124,77,255,.20),
            transparent 30%
        ),

        linear-gradient(
            135deg,
            #031126,
            #06234a,
            #073765
        );

    padding:25px;
}


/* ================= HEADER ================= */

.header{

    max-width:1150px;

    margin:auto;

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:18px 25px;

    background:
        rgba(4,20,45,.88);

    border:
        1px solid
        rgba(0,229,255,.25);

    border-radius:18px;

    box-shadow:
        0 10px 30px
        rgba(0,0,0,.3);
}

.logo{

    font-size:25px;

    font-weight:bold;

    color:#00e5ff;
}

.logo span{

    color:#ffb300;
}

.back{

    text-decoration:none;

    color:white;

    background:
        linear-gradient(
            90deg,
            #0099cc,
            #0066ff
        );

    padding:10px 20px;

    border-radius:25px;

    font-weight:bold;

    transition:.3s;
}

.back:hover{

    transform:translateY(-3px);

    box-shadow:
        0 0 20px
        rgba(0,229,255,.4);
}


/* ================= MAIN ================= */

.container{

    width:92%;

    max-width:1100px;

    margin:35px auto;
}


/* ================= PROFILE HEADER ================= */

.profile-header{

    text-align:center;

    margin-bottom:30px;
}

.profile-icon{

    width:110px;

    height:110px;

    margin:auto;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:50%;

    font-size:55px;

    background:
        linear-gradient(
            135deg,
            #00c6ff,
            #006eff,
            #7c4dff
        );

    border:
        4px solid
        rgba(255,255,255,.12);

    box-shadow:

        0 0 30px
        rgba(0,229,255,.35),

        0 0 60px
        rgba(124,77,255,.2);
}

h1{

    margin-top:18px;

    font-size:38px;

    background:
        linear-gradient(
            90deg,
            #00e5ff,
            #ffffff,
            #b388ff
        );

    -webkit-background-clip:text;

    -webkit-text-fill-color:transparent;
}

.subtitle{

    color:#8ddff0;

    margin-top:7px;
}


/* ================= CARD ================= */

.card{

    background:
        linear-gradient(
            145deg,
            rgba(12,45,78,.95),
            rgba(4,23,49,.96)
        );

    border:
        1px solid
        rgba(0,229,255,.20);

    border-radius:22px;

    padding:28px;

    margin-bottom:25px;

    box-shadow:
        0 15px 40px
        rgba(0,0,0,.3);
}

.card-title{

    font-size:21px;

    color:#00e5ff;

    margin-bottom:20px;

    font-weight:bold;
}


/* ================= PERSONAL INFO ================= */

.info-grid{

    display:grid;

    grid-template-columns:
        repeat(2,1fr);

    gap:15px;
}

.info{

    padding:18px;

    border-radius:15px;

    background:
        rgba(0,229,255,.06);

    border:
        1px solid
        rgba(255,255,255,.08);
}

.label{

    font-size:11px;

    color:#70d9ec;

    letter-spacing:1px;

    margin-bottom:8px;
}

.value{

    font-size:17px;

    font-weight:600;
}


/* ================= STATUS ================= */

.status{

    margin-top:18px;

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:17px 20px;

    border-radius:15px;

    background:
        rgba(0,200,83,.10);

    border:
        1px solid
        rgba(76,255,145,.25);
}

.active{

    color:#4cff91;

    font-weight:bold;
}

.dot{

    display:inline-block;

    width:10px;

    height:10px;

    background:#4cff91;

    border-radius:50%;

    margin-right:7px;

    box-shadow:
        0 0 12px #4cff91;
}


/* ================= VEHICLE ================= */

.vehicle-grid{

    display:grid;

    grid-template-columns:
        repeat(3,1fr);

    gap:15px;
}

.vehicle{

    padding:20px;

    text-align:center;

    border-radius:17px;

    background:
        linear-gradient(
            145deg,
            rgba(0,229,255,.08),
            rgba(124,77,255,.08)
        );

    border:
        1px solid
        rgba(255,255,255,.08);

    transition:.3s;
}

.vehicle:hover{

    transform:
        translateY(-5px);

    border-color:#00e5ff;
}

.vehicle-icon{

    font-size:30px;

    margin-bottom:10px;
}

.vehicle small{

    display:block;

    color:#72d8eb;

    margin-bottom:6px;
}

.vehicle strong{

    font-size:17px;
}


/* ================= STATISTICS ================= */

.stats{

    display:grid;

    grid-template-columns:
        repeat(4,1fr);

    gap:15px;
}

.stat{

    text-align:center;

    padding:22px 10px;

    border-radius:17px;

    background:
        rgba(0,0,0,.18);

    border:
        1px solid
        rgba(0,229,255,.10);
}

.stat-icon{

    font-size:30px;

    margin-bottom:8px;
}

.stat-value{

    font-size:25px;

    font-weight:bold;

    color:#ffffff;
}

.stat-name{

    color:#76dced;

    font-size:12px;

    margin-top:5px;
}


/* ================= CHARGING SUMMARY ================= */

.summary{

    display:grid;

    grid-template-columns:
        repeat(3,1fr);

    gap:15px;
}

.summary-box{

    padding:20px;

    border-radius:16px;

    background:
        rgba(0,229,255,.06);

    border:
        1px solid
        rgba(0,229,255,.12);
}

.summary-box h3{

    color:#00e5ff;

    margin-bottom:10px;
}

.summary-box p{

    color:#d7f7ff;
}


/* ================= ECO IMPACT ================= */

.eco{

    display:grid;

    grid-template-columns:
        repeat(3,1fr);

    gap:15px;
}

.eco-box{

    text-align:center;

    padding:22px;

    border-radius:17px;

    background:
        linear-gradient(
            135deg,
            rgba(0,200,83,.10),
            rgba(0,229,255,.07)
        );

    border:
        1px solid
        rgba(76,255,145,.15);
}

.eco-icon{

    font-size:32px;
}

.eco-value{

    font-size:25px;

    font-weight:bold;

    margin:7px 0;
}

.eco-name{

    color:#8be6c1;
}


/* ================= PREFERRED STATION ================= */

.station{

    display:flex;

    align-items:center;

    gap:20px;

    padding:22px;

    border-radius:17px;

    background:
        linear-gradient(
            90deg,
            rgba(255,179,0,.10),
            rgba(0,229,255,.06)
        );

    border:
        1px solid
        rgba(255,179,0,.18);
}

.station-icon{

    font-size:40px;
}

.station h3{

    margin-bottom:5px;

    color:#ffffff;
}

.station p{

    color:#8fdff0;
}


/* ================= PREFERENCES ================= */

.preferences{

    display:grid;

    grid-template-columns:
        repeat(2,1fr);

    gap:15px;
}

.preference{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:18px;

    background:
        rgba(0,229,255,.05);

    border-radius:15px;

    border:
        1px solid
        rgba(255,255,255,.07);
}

.preference span{

    color:#dffaff;
}


/* ================= TOGGLE ================= */

.toggle{

    width:45px;

    height:23px;

    background:#00bcd4;

    border-radius:20px;

    position:relative;
}

.toggle::after{

    content:"";

    position:absolute;

    width:18px;

    height:18px;

    background:white;

    border-radius:50%;

    top:2.5px;

    right:3px;
}


/* ================= BUTTONS ================= */

.buttons{

    display:flex;

    justify-content:center;

    gap:15px;

    margin-top:25px;
}

.btn{

    padding:12px 25px;

    border:none;

    border-radius:25px;

    color:white;

    font-weight:bold;

    cursor:pointer;

    text-decoration:none;

    background:
        linear-gradient(
            90deg,
            #0099cc,
            #0066ff
        );

    transition:.3s;
}

.btn:hover{

    transform:
        translateY(-3px);

    box-shadow:
        0 0 20px
        rgba(0,229,255,.35);
}

.btn.password{

    background:
        linear-gradient(
            90deg,
            #7c4dff,
            #9c27b0
        );
}


/* ================= FOOTER ================= */

.footer{

    text-align:center;

    color:#73b8ca;

    font-size:13px;

    line-height:1.8;

    margin:35px 0 15px;
}


/* ================= MOBILE ================= */

@media(max-width:750px){

    body{

        padding:15px;
    }

    .container{

        width:100%;
    }

    .info-grid,
    .preferences{

        grid-template-columns:1fr;
    }

    .vehicle-grid,
    .summary,
    .eco{

        grid-template-columns:1fr;
    }

    .stats{

        grid-template-columns:
            repeat(2,1fr);
    }

    .station{

        flex-direction:column;

        text-align:center;
    }

    .buttons{

        flex-direction:column;
    }

    h1{

        font-size:30px;
    }

}

</style>

</head>


<body>


<!-- ================= HEADER ================= -->

<div class="header">

    <div class="logo">
        ⚡ Smart<span>EV</span>
    </div>

    <a
        href="/dashboard"
        class="back"
    >
        ← Dashboard
    </a>

</div>


<div class="container">


<!-- ================= PROFILE HEADER ================= -->

<div class="profile-header">

    <div class="profile-icon">
        👤
    </div>

    <h1>
        My Profile
    </h1>

    <p class="subtitle">
        Smart City EV Charging Network
    </p>

</div>


<!-- ================= PERSONAL INFORMATION ================= -->

<div class="card">

    <div class="card-title">
        👤 Personal Information
    </div>

    <div class="info-grid">

        <div class="info">

            <div class="label">
                FULL NAME
            </div>

            <div class="value">
                Anjali Matsagar
            </div>

        </div>


        <div class="info">

            <div class="label">
                EMAIL
            </div>

            <div class="value">
                anjali@example.com
            </div>

        </div>


        <div class="info">

            <div class="label">
                ACCOUNT TYPE
            </div>

            <div class="value">
                🚗 EV User
            </div>

        </div>


        <div class="info">

            <div class="label">
                MEMBER SINCE
            </div>

            <div class="value">
                2026
            </div>

        </div>

    </div>


    <div class="status">

        <span>
            Account Status
        </span>

        <span class="active">

            <span class="dot"></span>

            Active

        </span>

    </div>

</div>


<!-- ================= VEHICLE DETAILS ================= -->

<div class="card">

    <div class="card-title">
        🚗 Vehicle Details
    </div>

    <div class="vehicle-grid">


        <div class="vehicle">

            <div class="vehicle-icon">
                🚙
            </div>

            <small>
                VEHICLE NUMBER
            </small>

            <strong>
                MH17CR2248
            </strong>

        </div>


        <div class="vehicle">

            <div class="vehicle-icon">
                ⚡
            </div>

            <small>
                VEHICLE TYPE
            </small>

            <strong>
                Electric Vehicle
            </strong>

        </div>


        <div class="vehicle">

            <div class="vehicle-icon">
                🔋
            </div>

            <small>
                BATTERY CAPACITY
            </small>

            <strong>
                40 kWh
            </strong>

        </div>


    </div>

</div>


<!-- ================= CHARGING STATISTICS ================= -->

<div class="card">

    <div class="card-title">
        📊 Charging Statistics
    </div>

    <div class="stats">


        <div class="stat">

            <div class="stat-icon">
                📅
            </div>

            <div class="stat-value">
                12
            </div>

            <div class="stat-name">
                TOTAL BOOKINGS
            </div>

        </div>


        <div class="stat">

            <div class="stat-icon">
                ⚡
            </div>

            <div class="stat-value">
                86
            </div>

            <div class="stat-name">
                kWh USED
            </div>

        </div>


        <div class="stat">

            <div class="stat-icon">
                🔌
            </div>

            <div class="stat-value">
                10
            </div>

            <div class="stat-name">
                COMPLETED
            </div>

        </div>


        <div class="stat">

            <div class="stat-icon">
                ⏱️
            </div>

            <div class="stat-value">
                18h
            </div>

            <div class="stat-name">
                CHARGING TIME
            </div>

        </div>


    </div>

</div>


<!-- ================= CHARGING SUMMARY ================= -->

<div class="card">

    <div class="card-title">
        ⚡ Charging Summary
    </div>

    <div class="summary">


        <div class="summary-box">

            <h3>
                🔋 Current Battery
            </h3>

            <p>
                72% charged
            </p>

        </div>


        <div class="summary-box">

            <h3>
                🕒 Last Charging
            </h3>

            <p>
                09 Aug 2026
            </p>

        </div>


        <div class="summary-box">

            <h3>
                💰 Total Spent
            </h3>

            <p>
                ₹1,850
            </p>

        </div>


    </div>

</div>


<!-- ================= ECO IMPACT ================= -->

<div class="card">

    <div class="card-title">
        🌱 Eco Impact
    </div>

    <div class="eco">


        <div class="eco-box">

            <div class="eco-icon">
                🌱
            </div>

            <div class="eco-value">
                68 kg
            </div>

            <div class="eco-name">
                CO₂ Saved
            </div>

        </div>


        <div class="eco-box">

            <div class="eco-icon">
                🌍
            </div>

            <div class="eco-value">
                420 km
            </div>

            <div class="eco-name">
                Green Distance
            </div>

        </div>


        <div class="eco-box">

            <div class="eco-icon">
                🌳
            </div>

            <div class="eco-value">
                3.2
            </div>

            <div class="eco-name">
                Tree Equivalent
            </div>

        </div>


    </div>

</div>


<!-- ================= PREFERRED STATION ================= -->

<div class="card">

    <div class="card-title">
        📍 Preferred Charging Station
    </div>

    <div class="station">

        <div class="station-icon">
            📍
        </div>

        <div>

            <h3>
                Aurangabad EV Charging Point
            </h3>

            <p>
                Preferred charging location
            </p>

        </div>

    </div>

</div>


<!-- ================= PREFERENCES ================= -->

<div class="card">

    <div class="card-title">
        🔔 Preferences
    </div>

    <div class="preferences">


        <div class="preference">

            <span>
                🔔 Booking Notifications
            </span>

            <div class="toggle"></div>

        </div>


        <div class="preference">

            <span>
                ⚡ Charging Alerts
            </span>

            <div class="toggle"></div>

        </div>


        <div class="preference">

            <span>
                📍 Station Updates
            </span>

            <div class="toggle"></div>

        </div>


        <div class="preference">

            <span>
                🌱 Eco Reports
            </span>

            <div class="toggle"></div>

        </div>


    </div>

</div>


<!-- ================= BUTTONS ================= -->

<div class="buttons">

    <a
        href="/edit-profile"
        class="btn"
    >
        ✏️ Edit Profile
    </a>


    <a
        href="/change-password"
        class="btn password"
    >
        🔐 Change Password
    </a>

</div>


<!-- ================= FOOTER ================= -->

<div class="footer">

    ⚡ Smart City EV Charging Network

    <br>

    Clean Energy • Smart Mobility • Better Future

</div>


</div>

</body>

</html>
`);

});
// ================= CHANGE PASSWORD =================

app.get("/change-password", (req, res) => {

    res.send(`
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>Change Password</title>

<style>

*{
    box-sizing:border-box;
    margin:0;
    padding:0;
    font-family:Arial,sans-serif;
}

body{

    min-height:100vh;

    display:flex;

    justify-content:center;

    align-items:center;

    background:

    radial-gradient(
        circle at 20% 20%,
        rgba(0,229,255,.18),
        transparent 30%
    ),

    radial-gradient(
        circle at 80% 80%,
        rgba(124,77,255,.20),
        transparent 30%
    ),

    linear-gradient(
        135deg,
        #031126,
        #073765
    );

    color:white;
}

.card{

    width:430px;

    padding:35px;

    background:
        rgba(7,30,60,.95);

    border:
        1px solid
        rgba(0,229,255,.25);

    border-radius:22px;

    box-shadow:
        0 20px 50px
        rgba(0,0,0,.4);
}

h1{

    text-align:center;

    color:#00e5ff;

    margin-bottom:10px;
}

.subtitle{

    text-align:center;

    color:#9bdbea;

    margin-bottom:30px;
}

label{

    display:block;

    margin-bottom:8px;

    color:#9eeaf7;
}

input{

    width:100%;

    padding:14px;

    margin-bottom:20px;

    border:none;

    outline:none;

    border-radius:12px;

    background:#102f55;

    color:white;

    border:
        1px solid
        rgba(0,229,255,.2);
}

input:focus{

    border-color:#00e5ff;
}

button{

    width:100%;

    padding:14px;

    border:none;

    border-radius:25px;

    background:
        linear-gradient(
            90deg,
            #0099cc,
            #0066ff
        );

    color:white;

    font-size:16px;

    font-weight:bold;

    cursor:pointer;
}

button:hover{

    box-shadow:
        0 0 20px
        rgba(0,229,255,.4);

    transform:
        translateY(-2px);
}

.back{

    display:block;

    text-align:center;

    margin-top:20px;

    color:#00e5ff;

    text-decoration:none;
}

</style>

</head>


<body>


<div class="card">

    <h1>
        🔐 Change Password
    </h1>

    <p class="subtitle">
        Update your Smart EV account password
    </p>


    <form
        method="POST"
        action="/change-password"
    >

        <label>
            Current Password
        </label>

        <input
            type="password"
            name="current_password"
            placeholder="Enter current password"
            required
        >


        <label>
            New Password
        </label>

        <input
            type="password"
            name="new_password"
            placeholder="Enter new password"
            required
        >


        <label>
            Confirm New Password
        </label>

        <input
            type="password"
            name="confirm_password"
            placeholder="Confirm new password"
            required
        >


        <button type="submit">
            Change Password
        </button>

    </form>


    <a
        href="/profile"
        class="back"
    >
        ← Back to Profile
    </a>

</div>


</body>

</html>
    `);

});


// ================= CHANGE PASSWORD POST =================

app.post("/change-password", (req, res) => {

    const {
        current_password,
        new_password,
        confirm_password
    } = req.body;


    if(new_password !== confirm_password){

        return res.send(`
            <script>

                alert("New passwords do not match!");

                window.location.href="/change-password";

            </script>
        `);

    }


    // Demo success message

    res.send(`
        <script>

            alert("Password changed successfully!");

            window.location.href="/profile";

        </script>
    `);

});


// ================= SERVER =================

app.listen(PORT, () => {

    console.log("--------------------------------");

    console.log(
        "🚗 Smart City EV Charging Network"
    );

    console.log(
        "🌐 http://localhost:3000/register"
    );

    console.log("--------------------------------");

});