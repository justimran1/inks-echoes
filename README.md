# Inks & Echoes 📚

A modern, minimal web app for discovering, reviewing, and sharing books—built with Node.js, Express, and EJS.

---

## Features

- **Browse Books:** View curated lists and details for each book.
- **Add & Edit Reviews:** Submit your own reviews and ratings.
- **Responsive Design:** Clean, mobile-friendly UI with elegant navigation and footer.
- **Search:** Find books by title using the navbar search.
- **Tabs & Sections:** Organized book details with easy navigation.

---

## Project Structure

```
backEnd/
│
├── server.js           # Express server
├── api.js              # API routes
├── form.js             # Form handling logic
├── package.json        # Dependencies
├── public/
│   ├── styles/         # CSS files (nav, index, footer, edit, new)
│   └── images/         # Logos, backgrounds, icons
├── views/
│   ├── index.ejs       # Home page
│   ├── view.ejs        # Book detail page
│   ├── edit.ejs        # Edit review page
│   ├── new.ejs         # Add book page
│   └── partials/       # Header & footer templates
└── README.md           # This file
```

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your database credentials.

3. **Run the server:**
   ```bash
   node server.js
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Usage

- **Home Page:** Browse featured books and recent reviews.
- **Book Detail:** Click a book to view details, reviews, and author info.
- **Add/Edit Review:** Use the forms to submit or update your review.
- **Search:** Use the navbar search to find books by title.

---

## Customization

- **Styling:** Edit CSS in `public/styles/` for colors, layout, and responsiveness.
- **Images:** Replace or add images in `public/images/` for branding.
- **Templates:** Update EJS files in `views/` for content and structure.

---

## License

MIT

---

**Made with ❤️ for readers and storytellers.**
