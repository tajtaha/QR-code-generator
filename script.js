const createButton = document.querySelector("#create-button");
const firstPage = document.querySelector("#first-page");
const secondPage = document.querySelector("#second-page");
const logoImage = document.querySelector("#logo-image");
const header = document.querySelector("#header");
const input = document.querySelector("#input");
const qrImage = document.getElementById("qr-image");

createButton.addEventListener("click", function () {
  const inputValue = input.value.trim();
  if (!inputValue) {
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
    secondPage.classList.remove("hidden");
    QRCode.toDataURL(inputValue, {
      width: 240,
      margin: 2,
    })
      .then(function (dataUrl1) {
        qrImage.src = dataUrl1;
      })
      .catch(function (err) {
        alert(`error: ${err}`);
      });
  }
});
