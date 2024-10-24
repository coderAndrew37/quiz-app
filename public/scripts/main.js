document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded.");

  // Function to fetch quizzes (mock API call)
  function fetchQuizzes() {
    fetch("/api/quizzes")
      .then((response) => response.json())
      .then((data) => {
        // Display quiz info (this is an example, update as needed)
        console.log("Quizzes:", data);
      })
      .catch((error) => console.error("Error fetching quizzes:", error));
  }

  // Fetch quizzes on load
  if (window.location.pathname === "/quiz.html") {
    fetchQuizzes();
  }
});
