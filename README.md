# RedotPay — Affiliate Landing Page

A bilingual (Arabic/English) landing page built to promote RedotPay offers through a referral link. Built with plain HTML/CSS/JS — no frameworks — and fully customizable from a single config file.

🔗 **Live site:** [redotpays.vercel.app](https://redotpays.vercel.app)

> ⚠️ This is an independent affiliate landing page, not RedotPay's official website.

---

## ✨ Features

- 🌐 Full Arabic (RTL) and English (LTR) support with instant switching
- 🎨 Dark fintech-inspired theme matching RedotPay's visual identity
- 📱 Fully responsive (Desktop / Tablet / Mobile)
- ⚙️ All links, images, colors, and stats managed from one config file (`config.js`)
- 🔍 SEO-ready: Open Graph, Twitter Cards, Schema.org, robots.txt, sitemap.xml
- 🎬 Video tutorial section, screenshot gallery, testimonials, FAQ, and animated counters

---

## 📁 Project Structure

```
├── index.html          # Main page (structure only, no hardcoded text)
├── config.js            # All settings: referral link, images, theme, stats
├── css/
│   └── style.css        # Full styling
├── js/
│   └── main.js           # Logic: translations, counters, menus, video modal
├── lang/
│   ├── ar.js             # All Arabic text
│   └── en.js             # All English text
├── robots.txt            # Search engine crawling rules
└── sitemap.xml           # XML sitemap
```

---

## 🛠️ How to Edit

### Change the referral link
Open `config.js` and edit:
```js
referralLink: "your-link-here"
```

### Change images / logo / video
All found in `config.js` under `images`, `logo`, and `youtubeVideo`.

### Change text
All visible text lives in `lang/ar.js` and `lang/en.js` — edit both files together to keep the two languages in sync.

### Change theme colors
Found in `config.js` under `theme` — any edit here updates the whole site automatically.

---

## 🚀 Deployment

The project is automatically deployed via **Vercel**, connected directly to this repository. Any push to the `main` branch triggers an automatic deployment within seconds.

---

## 📄 License

This is a personal project for marketing purposes. The visual identity is inspired by RedotPay and does not represent RedotPay's official website.
