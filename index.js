// index.js (API complète avec Puppeteer)
const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());

app.get("/api/passes/:userId", async (req, res) => {
  const userId = req.params.userId;
  const url = `https://www.roblox.com/users/${userId}/game-passes`;

  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const passes = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll(".game-pass-item"));
      return items.map((el) => {
        const id = el.getAttribute("data-pass-id");
        const name = el.querySelector(".text-label")?.innerText?.trim();
        return { id, name };
      });
    });

    await browser.close();

    // Supprime les invalides ou vides
    const valid = passes.filter((p) => p.id && p.name);
    res.json({ passes: valid });
  } catch (err) {
    console.error("Erreur Puppeteer:", err.message);
    res.status(500).json({ error: "Erreur interne via Puppeteer" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API Puppeteer en ligne sur le port ${PORT}`);
});
