const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if username meets requirements (e.g., length, special chars)
    return username && username.length >= 4 && /^[a-zA-Z0-9_]+$/.test(username);
};

const authenticatedUser = (username, password) => {
    // Check if username and password match any registered user
    return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ 
            message: "Login failed", 
            error: !username ? "Username is required" : "Password is required" 
        });
    }

    // Check if user credentials are valid
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ 
            message: "Login failed", 
            error: "Invalid username or password" 
        });
    }

    // Create JWT token
    const accessToken = jwt.sign(
        { username: username },
        "fingerprint_customer", // Secret key (should be in env variables in production)
        { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Save the token in session (assuming session middleware is configured)
    req.session.authorization = { accessToken };

    return res.status(200).json({
        message: "Login successful",
        username: username,
        token: accessToken,
        expiresIn: "1 hour"
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review; // Get review from query parameter
  const username = req.session.authorization?.username; // Get username from JWT

  // Check if user is logged in
  if (!username) {
/*    return res.status(403).json({ 
      message: "Unauthorized",
      error: "You must be logged in to post reviews"
    });*/
  }

  // Check if review text is provided
  if (!reviewText) {
    return res.status(400).json({ 
      message: "Review failed",
      error: "Review text is required in query parameters"
    });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ 
      message: "Review failed",
      error: `Book with ISBN ${isbn} not found`
    });
  }

  // Initialize reviews object if it doesn't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add/modify the review
  books[isbn].reviews[username] = reviewText;

  return res.status(200).json({
    message: "Review submitted successfully",
    isbn: isbn,
    title: books[isbn].title,
    your_review: reviewText,
    note: books[isbn].reviews[username] === reviewText ? 
          "Your existing review was updated" : 
          "New review was added"
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username; // Get username from session

  // Check if user is logged in
  if (!username) {
  /*  return res.status(403).json({ 
      message: "Unauthorized",
      error: "You must be logged in to delete reviews"
    });*/
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ 
      message: "Delete failed",
      error: `Book with ISBN ${isbn} not found`
    });
  }

  // Check if book has reviews
  if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
    return res.status(404).json({ 
      message: "Delete failed",
      error: `No reviews found for ISBN ${isbn}`
    });
  }

  // Check if user has a review for this book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ 
      message: "Delete failed",
      error: `No review found for your account on ISBN ${isbn}`,
      suggestion: "You can only delete your own reviews"
    });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    isbn: isbn,
    title: books[isbn].title,
    note: `Your review for ${books[isbn].title} has been removed`
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
