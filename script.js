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
const presetButtons = document.querySelectorAll(".preset-button");
const logoUpload = document.querySelector("#logo-upload");
const uploadLogoBtn = document.querySelector("#upload-logo-button");
const opacityBtn = document.querySelector("#opacity-button");
const qrTextInput = document.querySelector("#qr-text");

let qrText = "";
let bgImage = null;
let userLogoImage = null;
let bgOpacity = 0;
let animationId;
let t = 0;
let colorMode = "gradient";
let gradientColor1 = "#6a5cff";
let gradientColor2 = "#00ffd5";
let solidColor = "#6a5cff";

function startGradientAnimation() {
  cancelAnimationFrame(animationId);

  function drawCenteredText(ctx, text, options = {}) {
    let fontSize = options.fontSize || 22;
    const maxWidth = options.maxWidth || qrCanvas.clientWidth * 0.7;
    const lineHeight = options.lineHeight || fontSize * 1.2;
    const x = options.x || qrCanvas.clientWidth / 2;
    const y = options.y || qrCanvas.clientHeight / 2;
    const color = options.color || "white";
    const logoSize = options.logoSize || 0;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (text.length > 16) text = text.slice(0, 16);

    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (let word of words) {
      const testLine = currentLine ? currentLine + " " + word : word;
      ctx.font = `${fontSize}px Arial`;
      if (ctx.measureText(testLine).width > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const totalHeight = lines.length * lineHeight;
    let startY = y - totalHeight / 2;
    if (logoSize) startY -= logoSize / 2 + 10; // add gap above logo

    for (let line of lines) {
      ctx.fillText(line, x, startY + lineHeight / 2);
      startY += lineHeight;
    }
  }

  function animate() {
    qrCtx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);

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
    qrCtx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);

    qrCtx.globalCompositeOperation = "destination-in";
    qrCtx.drawImage(qrMaskCanvas, 0, 0);
    qrCtx.globalCompositeOperation = "source-over";

    if (qrText) {
      drawCenteredText(qrCtx, qrText, {
        color: "white",
        logoSize: userLogoImage ? qrCanvas.width * 0.25 : 0,
      });
    }

    if (bgImage && bgImage.complete) {
      qrCtx.globalAlpha = bgOpacity;
      qrCtx.drawImage(bgImage, 0, 0, qrCanvas.width, qrCanvas.height);
      qrCtx.globalAlpha = 1;
    }

    if (userLogoImage && userLogoImage.complete) {
      const logoSize = qrCanvas.width * 0.25;
      const centerX = qrCanvas.width / 2 - logoSize / 2;
      const centerY = qrCanvas.height / 2 - logoSize / 2;
      const padding = 5;
      const radius = 10;

      qrCtx.beginPath();
      qrCtx.roundRect(
        centerX - padding,
        centerY - padding,
        logoSize + padding * 2,
        logoSize + padding * 2,
        radius,
      );
      qrCtx.fillStyle = `rgba(255,255,255,${bgOpacity})`;
      qrCtx.fill();
      qrCtx.drawImage(userLogoImage, centerX, centerY, logoSize, logoSize);
    }

    t += 0.01;
    animationId = requestAnimationFrame(animate);
  }

  animate();
}

createButton.addEventListener("click", function () {
  const inputValue = input.value.trim();
  if (!inputValue) return;

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
      if (err) return;
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
      startGradientAnimation();
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
  await navigator.share({ files: [file], title: "Share QR Code" });
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

input.addEventListener("input", () => {
  clearButton.classList.toggle("hidden", input.value.trim() === "");
});
clearButton.addEventListener("click", () => {
  input.value = "";
  clearButton.classList.add("hidden");
});

openSettingsButton.addEventListener("click", () => {
  settingsDiv.classList.remove("translate-x-full");
  closeSettingsButton.classList.remove("hidden");
  openSettingsButton.classList.add("hidden");
  settingsDiv.classList.add(
    "transition-transform",
    "duration-500",
    "ease-in-out",
  );
});
closeSettingsButton.addEventListener("click", () => {
  function handleTransitionEnd() {
    closeSettingsButton.classList.add("hidden");
    openSettingsButton.classList.remove("hidden");
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

uploadLogoBtn.addEventListener("click", () => logoUpload.click());
logoUpload.addEventListener("change", () => {
  const file = logoUpload.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.src = reader.result;
    userLogoImage = img;
  };
  reader.readAsDataURL(file);
});

opacityBtn.addEventListener("click", () => {
  bgOpacity = bgOpacity === 0 ? 0.8 : 0;
  startGradientAnimation();
});

qrTextInput.addEventListener("input", () => {
  qrText = qrTextInput.value;
});
