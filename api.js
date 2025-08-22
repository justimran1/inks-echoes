import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import pg from "pg";
const app = express();
const port = 3000;
const APIURL = "https://openlibrary.org/search.json?q=";
const Author_url = "https://openlibrary.org/authors/";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "books",
  password: "olubodun112",
  port: 5432,
});
db.connect();
let author;
let isbn;
let ath;
let review_text;
let review_rating;
let review_date;
app.post("/add", async (req, res) => {
  const name = "harry potter";
  let books;
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
  }
  try {
    const result = (await axios.get(`${Author_url}${author}.json`)).data;
    ath = {
      ath_coverId: result.photos ? result.photos[0] : "No cover available",
      ath_bio: result.bio || "No bio available",
      ath_site: result.links ? result.links[0].url : "No site available",
    };
    console.log(ath);
  } catch (error) {
    console.error("error fetching data from author's API", error);
  }
  review_text = "the book is very interesting";
  review_rating = 5;
  review_date = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
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
      "INSERT INTO book_reviews (review_text, rating, review_date, book_id) VALUES ($1, $2, $3, (SELECT book_id FROM books WHERE isbn = $4))",
      [review_text, review_rating, review_date, isbn]
    );
  } catch (error) {
    console.error("Error inserting into DataBase:", error);
  }
});

// server start     //
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
