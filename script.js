const createButton = document.querySelector("#create-button");
const firstPage = document.querySelector("#first-page");
const secondPage = document.querySelector("#second-page");
const logoImage = document.querySelector("#logo-image");
const header = document.querySelector("#header");
const input = document.querySelector("#input");
const qrImage = document.querySelector("#qr-image");
const downloadButton = document.querySelector("#download-button");
const shareButton = document.querySelector("#share-button");
const mainParent = document.querySelector("#main-parent");

let qrcodeUrl = "";

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
    mainParent.classList.remove("w-full", "max-w-2xl", "px-4");
    secondPage.classList.remove("hidden");
    QRCode.toDataURL(inputValue, {
      width: 240,
      margin: 2,
    })
      .then(function (dataUrl1) {
        qrImage.src = dataUrl1;
        qrcodeUrl = dataUrl1;
      })
      .catch(function (err) {
        alert(`error: ${err}`);
      });
  }
});

downloadButton.addEventListener("click", function () {
  const a = document.createElement("a");
  a.href = qrImage.src;
  a.download = "QRCode.png";
  a.click();
});

shareButton.addEventListener("click", async function () {
  const response = await fetch(qrImage.src);
  const blob = await response.blob();

  const file = new File([blob], "image.png", { type: blob.type });

  await navigator.share({
    files: [file],
    title: "Share image",
  });
});
