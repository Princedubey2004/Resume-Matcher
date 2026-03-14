const SKILLS = require("../utils/skillList");

// Extract salary from JD text
// Handles formats: "12 LPA", "₹10,00,000 per annum", "$180,000 - $220,000"
function extractSalary(text) {
  const patterns = [
    /₹[\d,]+(?:\s*[-–]\s*₹[\d,]+)?\s*(?:per\s+annum|\/\s*year|pa)?/i,
    /\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*(?:per\s+annum|\/\s*year|annually))?/i,
    /\d+(?:\.\d+)?\s*(?:[-–]\s*\d+(?:\.\d+)?)?\s*LPA/i,
    /\d+(?:\.\d+)?\s*(?:[-–]\s*\d+(?:\.\d+)?)?\s*(?:lakhs?|lacs?)\s*(?:per\s+annum)?/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }

  return null;
}

// Extract required years of experience
function extractExperience(text) {
  if (/fresher|entry[\s-]level|0\s*years?/i.test(text)) return 0;

  const match = text.match(/(\d+)\+?\s*(?:[-–]\s*\d+)?\s*years?\s*(of\s+)?(experience|exp)?/i);
  if (match) return parseInt(match[1], 10);

  return null;
}

// Extract job role — looks for a role label or falls back to first meaningful line
function extractRole(text, jobId) {
  const roleMatch = text.match(/(?:role|position|title)\s*[:\-]?\s*(.+)/i);
  if (roleMatch) return roleMatch[1].trim();

  // Fallback: first non-empty line
  const firstLine = text.split("\n").map((l) => l.trim()).find((l) => l.length > 2);
  return firstLine || jobId;
}

// Split skills into required vs optional based on section headers in JD
function extractSkills(text) {
  const lowerText = text.toLowerCase();
  const requiredSkills = [];
  const optionalSkills = [];

  // Find optional section boundary
  const optionalMatch = lowerText.match(/(good[\s-]to[\s-]have|optional|preferred|nice[\s-]to[\s-]have)/i);
  const splitIndex = optionalMatch ? lowerText.indexOf(optionalMatch[0]) : text.length;

  const requiredText = text.slice(0, splitIndex);
  const optionalText = text.slice(splitIndex);

  for (const skill of SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");

    if (regex.test(requiredText)) {
      requiredSkills.push(skill);
    } else if (regex.test(optionalText)) {
      optionalSkills.push(skill);
    }
  }

  return { requiredSkills, optionalSkills };
}

// Build a short summary — grab the first sentence or up to 150 characters of text
function extractSummary(text) {
  const cleaned = text.replace(/\n+/g, " ").trim();
  const firstSentence = cleaned.match(/^.+?[.!?]/);
  if (firstSentence) return firstSentence[0].trim();
  return cleaned.slice(0, 150).trim();
}

// Parse a single JD object (with id and description fields)
function parseJD(jd) {
  const { id: jobId, description } = jd;
  const { requiredSkills, optionalSkills } = extractSkills(description);

  return {
    jobId,
    role: extractRole(description, jobId),
    salary: extractSalary(description),
    requiredExperience: extractExperience(description),
    requiredSkills,
    optionalSkills,
    aboutRole: extractSummary(description)
  };
}

// Parse an array of JD objects
function parseJDs(jdList) {
  return jdList.map(parseJD);
}

module.exports = { parseJDs };
