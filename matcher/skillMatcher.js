// Compare resume skills against a list of JD skills
// Returns skill analysis array and a matching score
function matchSkills(resumeSkills, jdSkills) {
  const resumeSkillsLower = resumeSkills.map((s) => s.toLowerCase());

  const skillsAnalysis = jdSkills.map((skill) => ({
    skill,
    presentInResume: resumeSkillsLower.includes(skill.toLowerCase())
  }));

  const matchedCount = skillsAnalysis.filter((s) => s.presentInResume).length;
  const totalCount = jdSkills.length;

  // Score formula: (matched / total) * 100, clamped between 0 and 100
  const matchingScore = totalCount > 0
    ? Math.round((matchedCount / totalCount) * 100)
    : 0;

  return { skillsAnalysis, matchingScore };
}

// Run matching for all parsed JDs against the resume
function matchResumeWithJDs(resume, parsedJDs) {
  const matchingJobs = parsedJDs.map((jd) => {
    // Combine required and optional skills for full analysis
    const allJDSkills = [...new Set([...jd.requiredSkills, ...jd.optionalSkills])];
    const { skillsAnalysis, matchingScore } = matchSkills(resume.resumeSkills, allJDSkills);

    return {
      jobId: jd.jobId,
      role: jd.role,
      salary: jd.salary,
      requiredExperience: jd.requiredExperience,
      aboutRole: jd.aboutRole,
      skillsAnalysis,
      matchingScore
    };
  });

  // Sort by best match first
  matchingJobs.sort((a, b) => b.matchingScore - a.matchingScore);

  // Pick salary from the best matching job for top-level display (as required by spec)
  const bestSalary = matchingJobs.length > 0 ? matchingJobs[0].salary : null;

  return {
    name: resume.name,
    salary: bestSalary,
    yearOfExperience: resume.yearOfExperience,
    resumeSkills: resume.resumeSkills,
    matchingJobs
  };
}

module.exports = { matchResumeWithJDs };
