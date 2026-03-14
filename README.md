# Resume Parsing & Job Matching System

A custom rule-based system I built to parse resumes and match them against job descriptions. Developed with Node.js using regex and a predefined skill dictionary. Created by Prince Dubey.

---

## Project Structure

```
resume-matcher/
├── index.js                  # Express server / entry point
├── parsers/
│   ├── resumeParser.js       # Parses resume PDF → name, experience, skills
│   └── jdParser.js           # Parses JD text → role, salary, skills, summary
├── matcher/
│   └── skillMatcher.js       # Compares skills, calculates matching score
├── utils/
│   └── skillList.js          # Master list of recognized skills
├── data/
│   └── sampleJDs.json        # Sample job descriptions for testing
└── output/
    └── result.json           # Output of last match run
```

---

## Setup

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`

---

## API

### `POST /match-resume`

**Form-data fields:**

| Field    | Type   | Description                              |
|----------|--------|------------------------------------------|
| `resume` | file   | Resume in PDF format                     |
| `jds`    | string | JSON array of job description objects    |

**JD array format:**

```json
[
  {
    "id": "JD001",
    "description": "Role: Backend Developer\n\nRequired Skills: Java, Spring Boot, MySQL...\n\nExperience: 4+ years\nSalary: 18 LPA"
  }
]
```

**Example using curl:**

```bash
curl -X POST http://localhost:3000/match-resume \
  -F "resume=@/path/to/resume.pdf" \
  -F "jds=$(cat data/sampleJDs.json)"
```

---

## Output Format

```json
{
  "name": "Prince Dubey",
  "yearOfExperience": 4,
  "resumeSkills": ["Java", "Spring Boot", "MySQL"],
  "matchingJobs": [
    {
      "jobId": "JD001",
      "role": "Backend Developer",
      "salary": "18 LPA",
      "requiredExperience": 4,
      "aboutRole": "We are looking for an experienced Backend Developer...",
      "skillsAnalysis": [
        { "skill": "Java", "presentInResume": true },
        { "skill": "Kafka", "presentInResume": false }
      ],
      "matchingScore": 60
    }
  ]
}
```

---

## How It Works

### Resume Parsing (`parsers/resumeParser.js`)
- Reads PDF using `pdf-parse`
- Extracts **name**: scans first 3 lines for a capitalized "First Last" pattern
- Extracts **experience**: regex match on patterns like `4+ years`, `Fresher`
- Extracts **skills**: case-insensitive word-boundary match against `skillList.js`

### JD Parsing (`parsers/jdParser.js`)
- Extracts **salary**: handles LPA, `₹`, `$` formats via regex
- Extracts **experience**: same pattern as resume parser
- Splits skills into **required** vs **optional** based on section headers (`Good to Have`, `Preferred`, etc.)
- Builds a short **summary** from the first sentence of the JD

### Skill Matching (`matcher/skillMatcher.js`)
- Compares resume skills against all JD skills (case-insensitive)
- Score formula: `(matched skills / total JD skills) × 100`
- Results sorted by score descending

---

## Recognized Skills

See `utils/skillList.js`. Includes languages, frameworks, databases, cloud tools, DevOps, and testing tools.
