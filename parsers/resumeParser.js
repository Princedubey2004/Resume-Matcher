const fs = require("fs");
const pdfParse = require("pdf-parse");
const SKILLS = require("../utils/skillList");

function extractName(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(lines[i])) return lines[i];
  }
  return lines[0] || "Unknown";
}

function extractExperience(text) {
  const match = text.match(/(\d+(?:\.\d+)?)\+?\s+years?\s*(of\s+)?(experience)?/i);
  if (match) return parseFloat(match[1]);
  if (/fresher|entry[\s-]level/i.test(text)) return 0;
  return null;
}

function extractSkills(text) {
  const found = [];
  for (const skill of SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(text)) {
      found.push(skill);
    }
  }
  return found;
}

async function parseResume(pdfPath) {
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(buffer);
  const text = data.text;

  return {
    name: extractName(text),
    yearOfExperience: extractExperience(text),
    resumeSkills: extractSkills(text)
  };
}

module.exports = { parseResume };
