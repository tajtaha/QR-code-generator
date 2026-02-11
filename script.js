const createButton = document.querySelector("#create-button");
const firstPage = document.querySelector("#first-page");
const secondPage = document.querySelector("#second-page");
const logoImage = document.querySelector("#logo-image");
const header = document.querySelector("#header");
const input = document.querySelector("#input");
const qrCanvas = document.querySelector("#qr-canvas");
const qrMaskCanvas = document.querySelector("#qr-mask");
const qrCtx = qrCanvas.getContext("2d");
const qrMaskCtx = qrMaskCanvas.getContext("2d");
const downloadButton = document.querySelector("#download-button");
const shareButton = document.querySelector("#share-button");
const backButton = document.querySelector("#back-button");
const clearButton = document.querySelector("#clear-button");
const openSettingsButton = document.querySelector("#open-settings-button");
const closeSettingsButton = document.querySelector("#close-settings-button");
const settingsDiv = document.querySelector("#settings-div");
const mainParent = document.querySelector("#main-parent");
let animationId;
let t = 0;

function startGradientAnimation() {
  cancelAnimationFrame(animationId);

  function animate() {
    qrCtx.clearRect(0, 0, 240, 240);

    const x1 = 120 + Math.cos(t) * 120;
    const y1 = 120 + Math.sin(t) * 120;
    const x2 = 120 - Math.cos(t) * 120;
    const y2 = 120 - Math.sin(t) * 120;

    const gradient = qrCtx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, "#6a5cff");
    gradient.addColorStop(1, "#00ffd5");

    qrCtx.fillStyle = gradient;
    qrCtx.fillRect(0, 0, 240, 240);

    qrCtx.globalCompositeOperation = "destination-in";
    qrCtx.drawImage(qrMaskCanvas, 0, 0);
    qrCtx.globalCompositeOperation = "source-over";

    t += 0.01;
    animationId = requestAnimationFrame(animate);
  }

  animate();
}

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
    QRCode.toCanvas(
      qrMaskCanvas,
      inputValue,
      {
        width: 240,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      },
      function (err) {
        if (err) {
          alert(err);
          return;
        }

        const imgData = qrMaskCtx.getImageData(
          0,
          0,
          qrMaskCanvas.width,
          qrMaskCanvas.height,
        );
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
            data[i + 3] = 0;
          }
        }
        qrMaskCtx.putImageData(imgData, 0, 0);

        startGradientAnimation();
      },
    );
  }
});

downloadButton.addEventListener("click", function () {
  const a = document.createElement("a");
  a.href = qrCanvas.toDataURL("image/png");
  a.download = "QRCode.png";
  a.click();
});

shareButton.addEventListener("click", async function () {
  const blob = await new Promise((resolve) =>
    qrCanvas.toBlob(resolve, "image/png"),
  );

  const file = new File([blob], "QRCode.png", { type: "image/png" });

  await navigator.share({
    files: [file],
    title: "Share QR Code",
  });
});

backButton.addEventListener("click", function () {
  logoImage.classList.remove("w-28", "h-28");
  header.classList.remove(
    "absolute",
    "top-0",
    "left-1/2",
    "transform",
    "-translate-x-1/2",
    "mt-4",
  );
  firstPage.classList.remove("hidden");
  mainParent.classList.add("w-full", "max-w-2xl", "px-4");
  secondPage.classList.add("hidden");
  clearButton.classList.add("hidden");
  input.value = "";
  cancelAnimationFrame(animationId);
  qrCtx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
});

input.addEventListener("input", function () {
  if (input.value.trim() !== "") {
    clearButton.classList.remove("hidden");
  } else {
    clearButton.classList.add("hidden");
  }
});

clearButton.addEventListener("click", function () {
  input.value = "";
  clearButton.classList.add("hidden");
});

openSettingsButton.addEventListener("click", function () {
  settingsDiv.classList.remove("translate-x-full");
  closeSettingsButton.classList.remove("hidden");
  openSettingsButton.classList.add("hidden");
  settingsDiv.classList.add(
    "transition-transform",
    "duration-500",
    "ease-in-out",
  );
});

closeSettingsButton.addEventListener("click", function () {
  function handleTransitionEnd() {
    closeSettingsButton.classList.add("hidden");
    openSettingsButton.classList.remove("hidden");

    // remove this listener after it fires
    settingsDiv.removeEventListener("transitionend", handleTransitionEnd);
  }

  settingsDiv.addEventListener("transitionend", handleTransitionEnd);
  settingsDiv.classList.add("translate-x-full");
  settingsDiv.classList.remove("transition-transform");
});
