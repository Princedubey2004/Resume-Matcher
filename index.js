const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { parseResume } = require("./parsers/resumeParser");
const { parseJDs } = require("./parsers/jdParser");
const { matchResumeWithJDs } = require("./matcher/skillMatcher");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/data", express.static(path.join(__dirname, "data")));

const upload = multer({ dest: path.join(__dirname, "uploads") });

app.post("/match-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Resume PDF is required." });
    if (!req.body.jds) return res.status(400).json({ error: "JDs JSON array is required." });

    let jdList;
    try {
      jdList = JSON.parse(req.body.jds);
    } catch {
      return res.status(400).json({ error: "Invalid JSON in jds field." });
    }

    const resume = await parseResume(req.file.path);
    const parsedJDs = parseJDs(jdList);
    const result = matchResumeWithJDs(resume, parsedJDs);

    const outputPath = path.join(__dirname, "output", "result.json");
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    fs.unlinkSync(req.file.path);

    return res.json(result);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
