const createButton = document.querySelector("#create-button");
const firstPage = document.querySelector("#first-page");
const secondPage = document.querySelector("#second-page");
const thirdPage = document.querySelector("#third-page");
const logoImage = document.querySelector("#logo-image");
const header = document.querySelector("#header");
const qrcodeInput = document.querySelector("#qrcode-input");
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
const deleteButton = document.querySelector("#remove-image-button");
const readerPageButton = document.querySelector("#reader-page-button");
const readQrcodeButton = document.querySelector("#read-qrcode-button");
const ReaderUploadInput = document.querySelector("#reader-upload-input");
const readerCanvas = document.querySelector("#reader-canvas");
const readerCtx = readerCanvas.getContext("2d");
const readerResult = document.querySelector("#reader-result");
const backToCreateQRCode = document.querySelector("#create-qrcode-button");
const solidColorInput = document.querySelector("#solid-color-input");
const solidColorPalette = document.querySelector("#solid-color-palette");
const gradientColor1Input = document.querySelector("#gradient-color-1-input");
const gradientColor2Input = document.querySelector("#gradient-color-2-input");
const gradientColor1Palette = document.querySelector(
  "#gradient-color-1-palette",
);
const gradientColor2Palette = document.querySelector(
  "#gradient-color-2-palette",
);

const solidColorApplyButton = document.querySelector(
  "#solid-color-apply-button",
);
const gradientColorApplyButton = document.querySelector(
  "#gradient-color-apply-button",
);

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
    if (logoSize) startY -= logoSize / 2 + 10;

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
  const inputValue = qrcodeInput.value.trim();
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

function closeSettings(callback) {
  if (settingsDiv.classList.contains("translate-x-full")) {
    if (callback) callback();
    return;
  }

  function handleTransitionEnd() {
    closeSettingsButton.classList.add("hidden");
    openSettingsButton.classList.remove("hidden");
    settingsDiv.removeEventListener("transitionend", handleTransitionEnd);
    if (callback) callback();
  }

  settingsDiv.addEventListener("transitionend", handleTransitionEnd);

  settingsDiv.classList.add("translate-x-full");
  settingsDiv.classList.remove("transition-transform");
}

closeSettingsButton.addEventListener("click", closeSettings);

backButton.addEventListener("click", function () {
  closeSettings(() => {
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

    cancelAnimationFrame(animationId);
    qrCtx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
    if (userLogoImage) {
      userLogoImage = null;
      bgImage = null;
      logoUpload.value = "";
      deleteButton.classList.add("hidden");
    }

    qrcodeInput.value = "";
    qrTextInput.value = "";
    qrText = "";

    colorMode = "gradient";
    gradientColor1 = "#6a5cff";
    gradientColor2 = "#00ffd5";
    solidColor = "#6a5cff";

    bgOpacity = 0;
    bgImage = null;
  });
});

qrcodeInput.addEventListener("input", () => {
  clearButton.classList.toggle("hidden", qrcodeInput.value.trim() === "");
});
clearButton.addEventListener("click", () => {
  qrcodeInput.value = "";
  clearButton.classList.add("hidden");
});

openSettingsButton.addEventListener("click", () => {
  settingsDiv.classList.remove("translate-x-full");
  closeSettingsButton.classList.remove("hidden", "-translate-x-full");
  openSettingsButton.classList.add("hidden");
  settingsDiv.classList.add(
    "transition-transform",
    "duration-500",
    "ease-in-out",
  );
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
    img.onload = () => {
      userLogoImage = img;
      deleteButton.classList.remove("hidden");
    };
    img.src = reader.result;
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

deleteButton.addEventListener("click", () => {
  userLogoImage = null;
  logoUpload.value = "";
  deleteButton.classList.add("hidden");
});

function ensureHasHash(input) {
  input.addEventListener("input", () => {
    if (!input.value.startsWith("#")) {
      input.value = "#" + input.value.replace(/#/g, "");
    }
  });
}

ensureHasHash(solidColorInput);
ensureHasHash(gradientColor1Input);
ensureHasHash(gradientColor2Input);

solidColorApplyButton.addEventListener("click", function () {
  const value = solidColorInput.value.trim();
  if (value === "") {
    alert("Enter a number");
  } else if (value.length < 6) {
    alert("Please enter valid numbers");
  } else if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    alert("Enter a valid hex color, e.g., #ff0000");
    return;
  } else {
    solidColor = value;
    colorMode = "solid";
    startGradientAnimation();
  }
});

gradientColorApplyButton.addEventListener("click", function () {
  const value1 = gradientColor1Input.value.trim();
  const value2 = gradientColor2Input.value.trim();

  if (value1 === "") {
    alert("Enter a number");
  } else if (value1.length < 6) {
    alert("Please enter valid numbers");
  } else if (value2 === "") {
    alert("Enter a number");
  } else if (value2.length < 6) {
    alert("Please enter valid numbers");
  } else if (!/^#[0-9A-Fa-f]{6}$/.test(value1)) {
    alert("Please Enter a valid Hex color: #000000");
  } else if (!/^#[0-9A-Fa-f]{6}$/.test(value2)) {
    alert("Please Enter a valid Hex color: #000000");
  } else {
    gradientColor1 = value1;
    gradientColor2 = value2;
    colorMode = "gradient";
    startGradientAnimation();
  }
});

solidColorPalette.addEventListener("input", function () {
  solidColor = solidColorPalette.value;
  colorMode = "solid";
  startGradientAnimation();
});

gradientColor1Palette.addEventListener("input", function () {
  gradientColor1 = gradientColor1Palette.value;
  gradientColor2 = gradientColor2Palette.value;
  colorMode = "gradient";
  startGradientAnimation();
});

gradientColor2Palette.addEventListener("input", function () {
  gradientColor1 = gradientColor1Palette.value;
  gradientColor2 = gradientColor2Palette.value;
  colorMode = "gradient";
  startGradientAnimation();
});

readerPageButton.addEventListener("click", function () {
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
  thirdPage.classList.remove("hidden");
});

backToCreateQRCode.addEventListener("click", function () {
  readerResult.textContent = "";
  readerCtx.clearRect(0, 0, readerCanvas.width, readerCanvas.height);

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
  thirdPage.classList.add("hidden");
});

readQrcodeButton.addEventListener("click", () => {
  ReaderUploadInput.click();
});

ReaderUploadInput.addEventListener("change", function () {
  const file = ReaderUploadInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      readerCtx.clearRect(0, 0, readerCanvas.width, readerCanvas.height);
      readerCanvas.width = image.width;
      readerCanvas.height = image.height;
      readerCtx.drawImage(image, 0, 0);

      const imageData = readerCtx.getImageData(
        0,
        0,
        readerCanvas.width,
        readerCanvas.height,
      );
      const code = jsQR(
        imageData.data,
        readerCanvas.width,
        readerCanvas.height,
      );

      const scannedText = code?.data?.trim();
      const urlPattern = /(?:https?:\/\/|www\.)[^\s]+/gi;

      if (!scannedText) {
        readerResult.textContent = "No QRCode Data";
      } else {
        readerResult.innerHTML = "";
        let lastIndex = 0;
        const matches = [...scannedText.matchAll(urlPattern)];

        if (matches.length === 0) {
          readerResult.textContent = scannedText;
        } else {
          matches.forEach((match) => {
            const rawUrl = match[0];
            const startIndex = match.index ?? 0;

            if (startIndex > lastIndex) {
              readerResult.appendChild(
                document.createTextNode(
                  scannedText.slice(lastIndex, startIndex),
                ),
              );
            }

            const cleanUrl = rawUrl.replace(/[),.!?]+$/, "");
            const trailingChars = rawUrl.slice(cleanUrl.length);

            const a = document.createElement("a");
            a.href = cleanUrl.startsWith("www.")
              ? `https://${cleanUrl}`
              : cleanUrl;
            a.textContent = cleanUrl;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.className = "text-blue-300 underline break-all";
            readerResult.appendChild(a);

            if (trailingChars) {
              readerResult.appendChild(document.createTextNode(trailingChars));
            }

            lastIndex = startIndex + rawUrl.length;
          });

          if (lastIndex < scannedText.length) {
            readerResult.appendChild(
              document.createTextNode(scannedText.slice(lastIndex)),
            );
          }
        }
      }
      ReaderUploadInput.value = "";
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (!createButton.classList.contains("hidden")) {
      createButton.click();
    }
    if (solidColorInput.matches(":focus")) {
      solidColorApplyButton.click();
    }
    if (
      gradientColor1Input.matches(":focus") ||
      gradientColor2Input.matches(":focus")
    ) {
      gradientColorApplyButton.click();
    }
  }
});

// copy button for results
// another settings panel for mobile
// some other responsive things at the end
// barcode creator
// barcode reader
// enter keyevent listener
// do the ui
