const express = require("express");
const path = require("path");
const YTDlpWrap = require("yt-dlp-wrap").default;

const app = express();
const ytDlpWrap = new YTDlpWrap();

const publicPath = path.join(process.cwd(), "public");
app.use(express.static(publicPath));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.post("/info", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL tidak disediakan." });
  try {
    let metadata = await ytDlpWrap.getVideoInfo(url);
    res.json({
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      originalUrl: url,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal mengambil info video. Pastikan URL valid." });
  }
});

app.get("/unduh", (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("URL tidak disediakan.");
  try {
    const ytdlpProcess = ytDlpWrap.exec([url, "-f", "best", "-o", "-"]);
    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
    res.setHeader("Content-Type", "video/mp4");
    ytdlpProcess.stdout.pipe(res);
  } catch (error) {
    if (!res.headersSent) res.status(500).send("Terjadi kesalahan.");
  }
});

app.get("/unduh-audio", (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("URL tidak disediakan.");
  try {
    const ytdlpProcess = ytDlpWrap.exec([
      url,
      "-x",
      "--audio-format",
      "mp3",
      "-o",
      "-",
    ]);
    res.setHeader("Content-Disposition", 'attachment; filename="audio.mp3"');
    res.setHeader("Content-Type", "audio/mpeg");
    ytdlpProcess.stdout.pipe(res);
  } catch (error) {
    if (!res.headersSent) res.status(500).send("Terjadi kesalahan.");
  }
});

// --- PENAMBAHAN UNTUK PENGEMBANGAN LOKAL ---
// Blok ini hanya akan berjalan saat Anda menjalankan `npm start` di komputer Anda
if (require.main === module) {
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
}
// ---------------------------------------------

module.exports = app;
