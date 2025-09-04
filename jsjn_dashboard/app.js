// Example placeholder for JSONBin integration
document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form");
  forms.forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      alert("Data submitted (dummy). Integrate JSONBin API here.");
    });
  });
});
