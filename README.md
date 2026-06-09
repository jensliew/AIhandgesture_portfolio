# AI Hand Gesture Portfolio

An interactive 3D portfolio for Jens Liew, built around a premium lab-showcase experience. Users can browse project cards manually with a trackpad, mouse wheel, or touch swipe, then opt into camera-based hand gestures for hands-free navigation.

Live site: [https://jensliew.github.io/AIhandgesture_portfolio](https://jensliew.github.io/AIhandgesture_portfolio)

## Highlights

- 3D project-card showcase powered by Three.js and CSS3DRenderer.
- Optional in-browser hand gesture controls using MediaPipe Hands.
- Manual browsing support for trackpad, mouse wheel, touch screens, and keyboard-free mobile use.
- Animated detail transitions with GSAP.
- Project detail pages with gesture and manual scrolling.
- English and Mandarin interface copy.
- Privacy-first camera flow: hand tracking runs in the browser and does not upload video.

## Gesture Map

Gesture mode is optional. After enabling camera access:

| Gesture | Action |
| --- | --- |
| Full open hand | Move left or right to swipe cards. In details, move up or down to scroll. |
| Fist | Release the carousel and snap to the nearest card. |
| Zoom pose | Open the selected project details. |
| Pinch | Exit details and return to card browsing. |

## Tech Stack

- HTML, CSS, and vanilla JavaScript modules
- Three.js
- Three.js CSS3DRenderer
- MediaPipe Hands
- GSAP
- Google Fonts

External libraries are loaded from CDNs in `index.html`, so there is no npm install step for the current version.

## Run Locally

Use a local web server instead of opening `index.html` directly. This keeps ES modules, CDN imports, and camera permissions working correctly.

```bash
cd /Users/jensliew/MyPortfolio
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

Camera access works best on `localhost`, `127.0.0.1`, or HTTPS.

## Project Structure

```text
.
|-- index.html
|-- images/
|   |-- profile.png
|   |-- seatong*.png
|   |-- awsRSVP*.png
|   `-- lms1.png.webp
|-- scripts/
|   |-- portfolio-app.mjs
|   |-- portfolio-data.mjs
|   |-- portfolio-gestures.mjs
|   |-- portfolio-render.mjs
|   |-- portfolio-scene.mjs
|   `-- portfolio-state.mjs
|-- styles/
|   `-- portfolio.css
`-- README.md
```

## Main Modules

- `scripts/portfolio-app.mjs` coordinates rendering, gestures, detail transitions, and UI events.
- `scripts/portfolio-data.mjs` stores portfolio records and bilingual UI copy.
- `scripts/portfolio-gestures.mjs` handles MediaPipe gesture detection and camera status messaging.
- `scripts/portfolio-scene.mjs` builds the Three.js scene, card carousel, and manual swipe behavior.
- `scripts/portfolio-render.mjs` generates shell, detail, language, and gesture-help markup.
- `scripts/portfolio-state.mjs` keeps app state transitions predictable.
- `styles/portfolio.css` contains the full visual system, responsive layout, and motion styling.

## Deployment

This repository is ready for GitHub Pages as a static site. The entry file is already `index.html`, so no build command is required.

Recommended GitHub Pages settings:

- Source: deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

## Author

Liew Shen Wei (Jens)

- Email: jensliew0704@gmail.com
- LinkedIn: [linkedin.com/in/shen-wei-liew-9341a430b](https://www.linkedin.com/in/shen-wei-liew-9341a430b)

## License

This project is for personal portfolio use.
