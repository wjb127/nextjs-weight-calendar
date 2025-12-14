const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const sizes = [192, 512];

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#3b82f6");
  gradient.addColorStop(1, "#2563eb");

  // Rounded rectangle background
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw scale icon
  ctx.strokeStyle = "white";
  ctx.lineWidth = size * 0.03;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const centerX = size / 2;
  const centerY = size / 2;
  const iconSize = size * 0.5;

  // Circle (scale outline)
  ctx.beginPath();
  ctx.arc(centerX, centerY, iconSize * 0.4, 0, Math.PI * 2);
  ctx.stroke();

  // Top tick
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - iconSize * 0.4);
  ctx.lineTo(centerX, centerY - iconSize * 0.5);
  ctx.stroke();

  // Bottom tick
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + iconSize * 0.4);
  ctx.lineTo(centerX, centerY + iconSize * 0.5);
  ctx.stroke();

  // Needle
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + iconSize * 0.2, centerY - iconSize * 0.15);
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.02, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(centerX - iconSize * 0.2, centerY);
  ctx.lineTo(centerX + iconSize * 0.2, centerY);
  ctx.lineWidth = size * 0.02;
  ctx.stroke();

  return canvas.toBuffer("image/png");
}

// Generate icons
const iconsDir = path.join(__dirname, "../public/icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach((size) => {
  const buffer = generateIcon(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated: ${filePath}`);
});

console.log("Icons generated successfully!");
