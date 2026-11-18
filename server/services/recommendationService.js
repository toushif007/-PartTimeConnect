/**
 * Rule-Based Job Recommendation Engine
 * Free, deterministic, and fast matching based on skills, location, and work mode.
 */

const calculateJobMatch = (studentProfile, job) => {
  const studentSkills = (studentProfile.skills || []).map((s) => s.toLowerCase().trim());
  const jobSkills = (job.requiredSkills || []).map((s) => s.toLowerCase().trim());

  // 1. Skills Matching (Weight: 50%)
  const matchingSkills = [];
  const missingSkills = [];

  jobSkills.forEach((jobSkill) => {
    const isMatched = studentSkills.some(
      (studentSkill) =>
        studentSkill === jobSkill ||
        studentSkill.includes(jobSkill) ||
        jobSkill.includes(studentSkill)
    );
    if (isMatched) {
      matchingSkills.push(jobSkill);
    } else {
      missingSkills.push(jobSkill);
    }
  });

  const skillsScore =
    jobSkills.length > 0
      ? (matchingSkills.length / jobSkills.length) * 100
      : 70; // default baseline if job has no explicit required skills

  // 2. Work Mode Matching (Weight: 20%)
  let workModeScore = 50;
  if (job.workMode === 'remote') {
    workModeScore = 100; // Anyone can do remote
  } else if (job.workMode === 'hybrid') {
    workModeScore = 80;
  } else if (job.workMode === 'on-site') {
    // If locations match, score high
    if (
      studentProfile.location &&
      job.location &&
      (studentProfile.location.toLowerCase().includes(job.location.toLowerCase()) ||
        job.location.toLowerCase().includes(studentProfile.location.toLowerCase()))
    ) {
      workModeScore = 100;
    } else {
      workModeScore = 40;
    }
  }

  // 3. Location Matching (Weight: 20%)
  let locationScore = 40;
  if (job.workMode === 'remote') {
    locationScore = 100;
  } else if (
    studentProfile.location &&
    job.location &&
    (studentProfile.location.toLowerCase().includes(job.location.toLowerCase()) ||
      job.location.toLowerCase().includes(studentProfile.location.toLowerCase()))
  ) {
    locationScore = 100;
  }

  // 4. Activity & Recency (Weight: 10%)
  const daysOld = Math.floor((Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));
  const recencyScore = Math.max(20, 100 - daysOld * 2);

  // Calculate Weighted Total Score
  const totalScore = Math.round(
    skillsScore * 0.5 + workModeScore * 0.2 + locationScore * 0.2 + recencyScore * 0.1
  );

  // Generate Explanation
  let explanation = '';
  if (totalScore >= 80) {
    explanation = `Excellent match! You possess ${matchingSkills.length} of ${jobSkills.length} required skills.`;
  } else if (totalScore >= 60) {
    explanation = `Good fit. Matches your profile with room to grow in ${missingSkills.slice(0, 2).join(', ') || 'related areas'}.`;
  } else {
    explanation = `Potential opportunity. Consider acquiring ${missingSkills.slice(0, 2).join(', ') || 'target skills'} to boost match.`;
  }

  return {
    matchScore: Math.min(100, Math.max(10, totalScore)),
    matchingSkills,
    missingSkills,
    explanation,
  };
};

const getRecommendedJobs = async (studentProfile, activeJobs) => {
  const scoredJobs = activeJobs.map((job) => {
    const analysis = calculateJobMatch(studentProfile, job);
    return {
      job,
      matchScore: analysis.matchScore,
      matchingSkills: analysis.matchingSkills,
      missingSkills: analysis.missingSkills,
      explanation: analysis.explanation,
    };
  });

  // Sort by highest match score
  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

  return scoredJobs;
};

module.exports = {
  calculateJobMatch,
  getRecommendedJobs,
};
