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
const presetButtons = document.querySelectorAll(".preset-btn");
let animationId;
let t = 0;
let colorMode = "gradient";
let gradientColor1 = "#6a5cff";
let gradientColor2 = "#00ffd5";
let solidColor = "#6a5cff";

function startGradientAnimation() {
  cancelAnimationFrame(animationId);

  function animate() {
    qrCtx.clearRect(0, 0, 240, 240);

    const x1 = 120 + Math.cos(t) * 120;
    const y1 = 120 + Math.sin(t) * 120;
    const x2 = 120 - Math.cos(t) * 120;
    const y2 = 120 - Math.sin(t) * 120;

    if (colorMode === "gradient") {
      const gradient = qrCtx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, gradientColor1);
      gradient.addColorStop(1, gradientColor2);
      qrCtx.fillStyle = gradient;
    } else {
      qrCtx.fillStyle = solidColor;
    }

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
    return;
  }

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
      color: { dark: "#000000", light: "#ffffff" },
    },
    function (err) {
      if (err) {
        alert(err);
        return;
      }

      // make white parts transparent
      const imgData = qrMaskCtx.getImageData(
        0,
        0,
        qrMaskCanvas.width,
        qrMaskCanvas.height,
      );
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255)
          data[i + 3] = 0;
      }
      qrMaskCtx.putImageData(imgData, 0, 0);

      const logo = new Image();
      logo.src = "resources/search.png";

      logo.onload = () => {
        function startGradientAnimation() {
          cancelAnimationFrame(animationId);

          function animate() {
            qrCtx.clearRect(0, 0, 240, 240);

            const x1 = 120 + Math.cos(t) * 120;
            const y1 = 120 + Math.sin(t) * 120;
            const x2 = 120 - Math.cos(t) * 120;
            const y2 = 120 - Math.sin(t) * 120;

            if (colorMode === "gradient") {
              const gradient = qrCtx.createLinearGradient(x1, y1, x2, y2);
              gradient.addColorStop(0, gradientColor1);
              gradient.addColorStop(1, gradientColor2);
              qrCtx.fillStyle = gradient;
            } else {
              qrCtx.fillStyle = solidColor;
            }

            qrCtx.fillRect(0, 0, 240, 240);

            qrCtx.globalCompositeOperation = "destination-in";
            qrCtx.drawImage(qrMaskCanvas, 0, 0);
            qrCtx.globalCompositeOperation = "source-over";

            const logoSize = qrCanvas.width * 0.25;
            const centerX = qrCanvas.width / 2 - logoSize / 2;
            const centerY = qrCanvas.height / 2 - logoSize / 2;
            const padding = 5; // extra space around logo
            const radius = 10; // corner radius

            qrCtx.fillStyle = "rgba(255, 255, 255, 0.0)"; // frosted glass
            qrCtx.beginPath();
            qrCtx.roundRect(
              centerX - padding,
              centerY - padding,
              logoSize + padding * 2,
              logoSize + padding * 2,
              radius,
            );
            qrCtx.fill();

            // Draw logo on top
            qrCtx.drawImage(logo, centerX, centerY, logoSize, logoSize);

            t += 0.01;
            animationId = requestAnimationFrame(animate);
          }

          animate();
        }

        startGradientAnimation();
      };
    },
  );
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

presetButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const type = this.dataset.type;

    if (type === "gradient") {
      colorMode = "gradient";
      gradientColor1 = this.dataset.c1;
      gradientColor2 = this.dataset.c2;
    } else {
      colorMode = "solid";
      solidColor = this.dataset.c1;
    }
  });
});
