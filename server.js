require("dotenv").config();
import express from "express";
import pg from "pg";
import axios from "axios";
import bodyParser from "body-parser";
const APIURL = "https://openlibrary.org/search.json?q=";
const Author_url = "https://openlibrary.org/authors/";
const server = express();
const port = process.env.PORT || 3000;

const { Pool } = require("pg");
const db = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static("public"));
server.set("view engine", "ejs");

let books = [];
let author;
let isbn;
let ath;
let review_text;
let review_rating;
let review_date;
let books4;
let rem_books;
async function getbooks() {
  const result = await db.query(
    "SELECT books.book_id,books.title,books.author,books.cover_id,books.first_published,author.author_bio,author.author_site,author.author_cover_id,book_reviews.rating,book_reviews.review_date,book_reviews.review_text FROM books INNER JOIN author ON books.book_id = author.author_id INNER JOIN book_reviews ON books.book_id = book_reviews.book_id;"
  );
  books = result.rows;
  return books;
}
async function sortByRating() {
  const result = await db.query(
    "SELECT books.book_id,books.title,books.author,books.cover_id,books.first_published,author.author_bio,author.author_site,author.author_cover_id,book_reviews.rating,book_reviews.review_date,book_reviews.review_text FROM books INNER JOIN author ON books.book_id = author.author_id INNER JOIN book_reviews ON books.book_id = book_reviews.book_id ORDER BY book_reviews.rating DESC;"
  );
  console.log(result.rows);
  return result.rows;
}
async function sortByReviewDate() {
  const result = await db.query(
    "SELECT books.book_id,books.title,books.author,books.cover_id,books.first_published,author.author_bio,author.author_site,author.author_cover_id,book_reviews.rating,book_reviews.review_date,book_reviews.review_text FROM books INNER JOIN author ON books.book_id = author.author_id INNER JOIN book_reviews ON books.book_id = book_reviews.book_id ORDER BY book_reviews.review_date DESC;"
  );
  return result.rows;
}
//get route
server.get("/", async (req, res) => {
  const result = await getbooks();
  books4 = result.slice(0, 5);
  rem_books = result.slice(5);
  // console.log(result);
  res.render("index", {
    four_books: books4,
    rem_books: rem_books,
  });
});
// get edit page
server.get("/editpage/:id", async (req, res) => {
  const result = await getbooks();
  const book = result;
  const id = parseInt(req.params.id);
  const foundBook = book.find((b) => b.book_id == id);
  res.render("edit", {
    books: foundBook,
    submit: "submit",
  });
});
// get new page
server.get("/newpage", async (req, res) => {
  res.render("edit", {
    submit: "Add Book",
  });
});
//get data about book whilist adding a new book
server.get("/search", async (req, res) => {
  const searchQuery = req.query.title;
  try {
    // Example: fetching data from OpenLibrary API
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${searchQuery}`
    );
    const data = await response.json();

    // Map results into a cleaner structure
    const books = data.docs.map((book) => {
      return {
        title: book.title,
        author: book.author_name ? book.author_name.join(", ") : "Unknown",
        coverUrl: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : "/default-cover.jpg",
      };
    });

    // Pass data into your EJS template
    res.render("new", { books, searchQuery });
  } catch (err) {
    console.error(err);
    res.render("new", { books: [], searchQuery });
  }
});
//get a particular post by the id
server.get("/books/:id", async (req, res) => {
  const books = await getbooks();
  const id = parseInt(req.params.id);
  const foundBook = books.find((b) => b.book_id == id);
  console.log(foundBook);
  res.render("view", {
    books: foundBook,
  });
});
//sort books by rating
server.get("/rating", async (req, res) => {
  const sortedBooks = await sortByRating();
  books4 = sortedBooks.slice(0, 5);
  rem_books = sortedBooks.slice(5);
  console.log(books4);
  console.log(rem_books);
  res.render("index", {
    four_books: books4,
    rem_books: rem_books,
  });
});
//sort books by review date
server.get("/review_date", async (req, res) => {
  const result = await sortByReviewDate();
  books4 = result.slice(0, 5);
  rem_books = result.slice(5);
  res.render("index", {
    four_books: books4,
    rem_books: rem_books,
  });
});

server.post("/add", async (req, res) => {
  let books;
  const name = req.body.title;
  try {
    const response = (
      await axios.get(
        `${APIURL}${name}&fields=key,title,author_key,author_name,cover_i,first_publish_year,subject,isbn`
      )
    ).data;
    books = response.docs
      .map((e) => ({
        author_key: e.author_key,
        author_name: e.author_name ? e.author_name[0] : "Unknown",
        cover_i: e.cover_i,
        first_publish_year: e.first_publish_year,
        key: e.key,
        subject: e.subject ? e.subject[0].toString() : "Unknown",
        title: e.title,
        isbn: e.isbn ? e.isbn[0] : null,
      }))
      .slice(0, 1);
    console.log(books);
    author = books[0].author_key[0];
    isbn = books[0].isbn || "No ISBN available";
  } catch (error) {
    console.error("Error fetching data from API:", error);
    res.render("edit", {
      error: "Error fetching book data. Please try again.",
      submit: "Add Book",
    });
  }
  try {
    const result = (await axios.get(`${Author_url}${author}.json`)).data;
    ath = {
      ath_coverId: result.photos ? result.photos[0] : "No cover available",
      ath_bio: result.bio.value || "No bio available",
      ath_site: result.links ? result.links[0].url : "No site available",
    };
    console.log(ath);
  } catch (error) {
    console.error("error fetching data from author's API", error);
  }
  review_text = req.body.review_text || "No review available";
  review_rating = req.body.review_rating || 1;
  review_date = req.body.review_date; // Get user date
  //insert the results into the database
  try {
    await db.query(
      "INSERT INTO books (title, author, cover_id, first_published, isbn) VALUES ($1, $2, $3, $4, $5)",
      [
        books[0].title,
        books[0].author_name,
        books[0].cover_i || "No cover available",
        books[0].first_publish_year || "Unknown",
        books[0].isbn || "No ISBN available",
      ]
    );
    await db.query(
      "INSERT INTO author (author_site, author_bio, author_cover_id, isbn) VALUES ($1, $2, $3, $4)",
      [ath.ath_site, ath.ath_bio, ath.ath_coverId, isbn]
    );
    await db.query(
      "UPDATE author SET author_id = books.book_id FROM books WHERE books.isbn = author.isbn;"
    );
    await db.query(
      "INSERT INTO book_reviews (review_text, rating, review_date, book_id) SELECT $1, $2, $3, book_id FROM books WHERE isbn = $4",
      [review_text, review_rating, review_date, isbn]
    );
  } catch (error) {
    console.error("Error inserting into DataBase:", error);
  }
  res.redirect("/");
});

//update reviews
server.post("/edit/:id", async (req, res) => {
  const books = await getbooks();
  const id = parseInt(req.params.id);
  const original_book = books.find((e) => e.book_id == id);
  const review_text = req.body.review_text || original_book.review_text;
  if (!original_book) {
    return res.status(404).json({ message: "book not found" });
  }
  await db.query(
    "UPDATE book_reviews SET review_text = $1 WHERE book_id = $2",
    [review_text, id]
  );
  res.redirect("/");
});
//delete books
server.get("/delete/:id", async (req, res) => {
  const books = await getbooks();
  if (!books) {
    res.status(404).json({ error: "No books found" });
  }
  const id = parseInt(req.params.id);
  const postIndex = books.findIndex((e) => e.book_id == id);
  if (postIndex > -1) {
    await db.query("DELETE FROM book_reviews WHERE book_id = $1", [id]);
    res.redirect("/");
  } else {
    res.status(404).json({ error: `The book with the id ${id} is not found` });
  }
});
//server listen
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
