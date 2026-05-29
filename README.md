# AI Hand Gesture Portfolio

An interactive 3D portfolio website controlled entirely by **AI-powered hand gesture recognition**. Navigate through project cards, open details, and scroll — all without touching your keyboard or mouse.

## ✨ Features

- **Hand Gesture Navigation** — Uses MediaPipe Hands for real-time gesture detection via webcam
- **3D Card Carousel** — Built with Three.js and CSS3DRenderer for immersive project browsing
- **Gesture Controls:**
  - ✋ Open Palm → Swipe through cards / Scroll detail pages
  - ✊ Fist → Brake and lock focus
  - 🖖 Index + Thumb Spread → Enter detail view
  - 🤏 Index + Thumb Pinch → Exit detail view
- **Privacy-First** — All processing happens locally in the browser. No data is recorded or transmitted.
- **Bilingual Instructions** — Toggle between English and Mandarin (中文)
- **High-Tech Background** — Animated particle systems, grid floors, floating rings, hexagons, and neural connection lines

## 🛠 Tech Stack

- **Three.js** — 3D rendering and particle systems
- **MediaPipe Hands** — AI hand landmark detection
- **CSS3DRenderer** — 3D card positioning in DOM
- **GSAP** — Smooth animations and transitions
- **Vanilla HTML/CSS/JS** — No build tools required

## 🚀 Live Demo

👉 [https://jensliew.github.io/AIhandgesture_portfolio](https://jensliew.github.io/AIhandgesture_portfolio)

## 📁 Project Structure

```
├── index.html          # Main application file
├── images/
│   ├── profile.png     # Profile photo
│   ├── seatong1-5.png  # SeaTong project screenshots
│   ├── awsRSVP1-4.png  # AWS RSVP project screenshots
│   └── lms1.png.webp   # LMS project screenshot
└── README.md
```

## 🖥 Requirements

- A modern browser (Chrome, Edge, Firefox) with webcam access
- HTTPS is required for camera API (GitHub Pages provides this automatically)

## 📦 Deployment (GitHub Pages)

1. **Rename the HTML file:**
   ```bash
   mv ai_studio_code.html index.html
   ```

2. **Initialize git and push:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AI Hand Gesture Portfolio"
   git remote add origin https://github.com/jensliew/AIhandgesture_portfolio.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repo: https://github.com/jensliew/AIhandgesture_portfolio
   - Navigate to **Settings** → **Pages**
   - Under "Source", select **Deploy from a branch**
   - Choose branch: `main`, folder: `/ (root)`
   - Click **Save**

4. **Wait 1-2 minutes**, then your site is live at:
   ```
   https://jensliew.github.io/AIhandgesture_portfolio
   ```

## 👤 Author

**Liew Shen Wei (Jens)**
- Email: jensliew0704@gmail.com
- LinkedIn: [linkedin.com/in/shen-wei-liew-9341a430b](https://www.linkedin.com/in/shen-wei-liew-9341a430b)

## 📄 License

This project is for personal portfolio use.
