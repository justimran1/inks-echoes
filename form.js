const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
let timeoutId;

// Prevent default form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();
});

// Handle typing
input.addEventListener("input", () => {
  clearTimeout(timeoutId);

  const term = input.value.trim();
  if (!term) {
    resultsDiv.innerHTML = "";
    return;
  }

  timeoutId = setTimeout(async () => {
    const res = await fetch(`/search?query=${encodeURIComponent(term)}`);
    const data = await res.json();

    resultsDiv.innerHTML = data
      .map(
        (book) => `
      <div class="book-card">
        <img src="${book.coverUrl}" alt="Book cover" width="80" />
        <div>
          <h3>${book.title}</h3>
          <p>${book.author}</p>
        </div>
      </div>
    `
      )
      .join("");
  }, 400);
});
