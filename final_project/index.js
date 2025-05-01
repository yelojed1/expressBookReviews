const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Enhanced Session Configuration
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: false,               // Don't resave unchanged sessions
    saveUninitialized: false,     // Don't save empty sessions
    cookie: { 
        secure: false,           // Set to true in production with HTTPS
        httpOnly: true,          // Prevent client-side JS access
        maxAge: 3600000          // 1 hour expiration
    }
}));

// Improved Authentication Middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check both session AND authorization header
    const token = req.session.authorization?.accessToken || 
                 req.headers.authorization?.split(' ')[1];    
    if (!token) {
        console.error("Auth Error: No token found in session");
        return res.status(401).json({ 
            message: "Unauthorized",
            details: "Please login first",
            solution: "Send a POST request to /customer/login with credentials"
        });
    }

    // Verify token
    jwt.verify(token, "fingerprint_customer", (err, user) => {
        if (err) {
            console.error("Token Verification Failed:", err.message);
            return res.status(403).json({ 
                message: "Forbidden",
                error: "Invalid or expired token",
                solution: "Login again to get a new token"
            });
        }
        
        // Attach user to request
        req.user = user;
        console.log("Authenticated user:", user.username);
        next();
    });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
