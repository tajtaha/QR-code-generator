const createButton = document.querySelector("#create-button");
const firstPage = document.querySelector("#first-page");
const logoImage = document.querySelector("#logo-image");
const header = document.querySelector("#header");
const input = document.querySelector("#input");
createButton.addEventListener("click", function () {
  if (input.value === "") {
    alert("input is empty.");
  } else {
    console.log("created the qrcode!");
    logoImage.classList.add("w-28", "h-28");
    header.classList.add(
      "absolute",
      "top-0",
      "left-1/2",
      "transform",
      "-translate-x-1/2",
      "mt-4",
    );
    firstPage.classList.add("hidden");
  }
});
