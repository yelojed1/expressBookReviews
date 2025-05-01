const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Return the list of books as a neatly formatted JSON response
  return res.status(200).json(JSON.stringify(books, null, 4));
});

public_users.get('/isbn/:isbn', function (req, res) {
  // Retrieve the ISBN from request parameters
  const isbn = req.params.isbn;
  
  // Check if book exists with the given ISBN
  if (books[isbn]) {
    // Return the book details as a neatly formatted JSON response
    return res.status(200).json(JSON.stringify(books[isbn], null, 4));
  } else {
    // Return error if book not found
    return res.status(404).json({message: "Book not found with ISBN: " + isbn});
  }
});

public_users.get('/author/:author', function (req, res) {
  const authorName = req.params.author;
  const matchingBooks = [];

  // Get all ISBN keys from the books object
  const isbns = Object.keys(books);

  // Iterate through all books
  for (const isbn of isbns) {
    const book = books[isbn];
    // Check if author matches (case insensitive)
    if (book.author.toLowerCase().includes(authorName.toLowerCase())) {
      matchingBooks.push({
        isbn: isbn,
        title: book.title,
        author: book.author, // Include author in response for clarity
        reviews: book.reviews
      });
    }
  }

  if (matchingBooks.length > 0) {
    // Return matching books with success status
    return res.status(200).json({
      message: `${matchingBooks.length} book(s) found`,
      books: matchingBooks
    });
  } else {
    // Return error if no books found
    return res.status(404).json({ 
      message: `No books found by author containing: "${authorName}"`,
      suggestion: "Please check the spelling or try a partial author name"
    });
  }
});

public_users.get('/title/:title', function (req, res) {
  const searchTitle = req.params.title.toLowerCase(); // Get and normalize search title
  const matchingBooks = [];

  // Iterate through all books
  for (const [isbn, book] of Object.entries(books)) {
    // Check if title matches (case insensitive, partial match)
    if (book.title.toLowerCase().includes(searchTitle)) {
      matchingBooks.push({
        isbn: isbn,
        title: book.title,
        author: book.author,
        reviews: book.reviews
      });
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json({
      count: matchingBooks.length,
      message: `Found ${matchingBooks.length} book(s) with matching title`,
      books: matchingBooks
    });
  } else {
    return res.status(404).json({ 
      message: `No books found containing title: "${req.params.title}"`,
      suggestion: "Try a different search term or check the spelling"
    });
  }
});

// Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
