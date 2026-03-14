const path = require("path");
const fs = require("fs");

const { parseResume } = require("./parsers/resumeParser");
const { parseJDs } = require("./parsers/jdParser");
const { matchResumeWithJDs } = require("./matcher/skillMatcher");

const sampleJDs = require("./data/sampleJDs.json");
const RESUME_PATH = path.join(__dirname, "data", "resume.pdf");

async function run() {
  if (!fs.existsSync(RESUME_PATH)) {
    console.error("resume.pdf not found at:", RESUME_PATH);
    process.exit(1);
  }

  const resume = await parseResume(RESUME_PATH);

  console.log("\nResume parsed:");
  console.log("  Name        :", resume.name);
  console.log("  Experience  :", resume.yearOfExperience);
  console.log("  Skills      :", resume.resumeSkills.join(", "));

  const parsedJDs = parseJDs(sampleJDs);
  const result = matchResumeWithJDs(resume, parsedJDs);

  console.log("\n--- Result ---\n");
  console.log(JSON.stringify(result, null, 2));

  const outputPath = path.join(__dirname, "output", "result.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log("\nSaved to:", outputPath);
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
