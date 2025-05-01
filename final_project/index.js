const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session configuration
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if session exists and has a valid token
    if (req.session && req.session.accessToken) {
        jwt.verify(req.session.accessToken, "fingerprint_customer", (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired token" });
            }
            // Token is valid, attach user info to request
            req.user = decoded;
            next();
        });
    } else {
        return res.status(401).json({ message: "Unauthorized: No valid session token" });
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));
