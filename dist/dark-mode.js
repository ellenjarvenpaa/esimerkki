const checkbox = document.getElementById("checkbox");
checkbox.addEventListener("change", () => {
  document.body.classList.toggle("dark");

  let resarea = document.querySelector(".grid");
  resarea.classList.toggle("dark");
});
