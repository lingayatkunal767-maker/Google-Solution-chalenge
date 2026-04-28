// functions/matchingEngine.js
// VolunteerMatch AI - Core Scoring Algorithm
// MATCH_SCORE = (SkillFit × 0.40) + (Availability × 0.30) + (Location × 0.20) + (Interest × 0.10)

/**
 * Calculate the haversine distance between two coordinates (in km)
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * SkillFit Score (0–100)
 * Ratio of matched required skills to total required skills
 */
function calculateSkillFit(volunteerSkills = [], requiredSkills = []) {
  if (!requiredSkills.length) return 100;
  const volunteerSkillSet = new Set(volunteerSkills.map(s => s.toLowerCase()));
  const matched = requiredSkills.filter(s => volunteerSkillSet.has(s.toLowerCase())).length;
  return Math.round((matched / requiredSkills.length) * 100);
}

/**
 * Availability Score (0–100)
 * Matches urgency against volunteer availability windows
 */
function calculateAvailability(volunteerAvailability = {}, needUrgency = 'planned') {
  const { weekdays = false, weekends = false, flexibleHours = [] } = volunteerAvailability;
  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;

  const baseDayMatch = isWeekend ? weekends : weekdays;

  const urgencyWeights = {
    immediate: { requiresFlex: true, baseScore: 100 },
    urgent: { requiresFlex: false, baseScore: 80 },
    planned: { requiresFlex: false, baseScore: 60 },
  };

  const { requiresFlex, baseScore } = urgencyWeights[needUrgency] || urgencyWeights['planned'];

  if (!baseDayMatch) {
    // Not available on that day type
    if (flexibleHours.length > 0) return Math.round(baseScore * 0.6); // partial credit
    return 20;
  }

  if (requiresFlex && flexibleHours.length === 0) return Math.round(baseScore * 0.7);
  if (flexibleHours.length > 0) return baseScore;

  return Math.round(baseScore * 0.85);
}

/**
 * Location Score (0–100)
 * Distance-based score: 0km = 100, 50km+ = 0
 */
function calculateLocationScore(volunteerLoc, needLoc) {
  if (!volunteerLoc?.lat || !volunteerLoc?.lng || !needLoc?.lat || !needLoc?.lng) {
    return 50; // neutral if no location data
  }

  const distKm = haversineDistance(
    volunteerLoc.lat,
    volunteerLoc.lng,
    needLoc.lat,
    needLoc.lng
  );

  // Score decay: full score within 5km, drops to 0 at 50km+
  if (distKm <= 5) return 100;
  if (distKm >= 50) return 0;
  return Math.round(100 * (1 - (distKm - 5) / 45));
}

/**
 * Interest Score (0–100)
 * Based on past volunteer category preferences
 */
function calculateInterestScore(volunteerPastTasks = [], needCategory = '', allCompletedNeeds = []) {
  if (!volunteerPastTasks.length || !needCategory) return 50; // neutral

  // Count category frequency in past tasks
  const categoryCounts = {};
  allCompletedNeeds
    .filter(n => volunteerPastTasks.includes(n.id))
    .forEach(n => {
      if (n.category) {
        categoryCounts[n.category] = (categoryCounts[n.category] || 0) + 1;
      }
    });

  const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  if (!total) return 50;

  const categoryCount = categoryCounts[needCategory] || 0;
  return Math.round((categoryCount / total) * 100);
}

/**
 * Main Match Score Calculator
 * Returns score and breakdown for a single volunteer-need pair
 */
function calculateMatchScore(volunteer, need, allCompletedNeeds = []) {
  const skillFit = calculateSkillFit(volunteer.skills, need.requiredSkills);
  const availability = calculateAvailability(volunteer.availability, need.urgency);
  const location = calculateLocationScore(volunteer.location, need.location);
  const interest = calculateInterestScore(volunteer.pastTasks, need.category, allCompletedNeeds);

  const score =
    skillFit * 0.4 +
    availability * 0.3 +
    location * 0.2 +
    interest * 0.1;

  return {
    score: Math.round(score * 10) / 10,
    scoreBreakdown: { skillFit, availability, location, interest },
    explanation: generateExplanation({ skillFit, availability, location, interest, score }),
  };
}

/**
 * Generate human-readable explanation for the match
 */
function generateExplanation({ skillFit, availability, location, interest, score }) {
  const parts = [];

  if (skillFit >= 80) parts.push(`Strong skill alignment (${skillFit}%)`);
  else if (skillFit >= 50) parts.push(`Partial skill match (${skillFit}%)`);
  else parts.push(`Limited skill overlap (${skillFit}%)`);

  if (availability >= 80) parts.push('fully available');
  else if (availability >= 50) parts.push('partially available');
  else parts.push('limited availability');

  if (location >= 80) parts.push('nearby location');
  else if (location >= 40) parts.push('moderate distance');
  else parts.push('far location');

  if (interest >= 70) parts.push('strong past interest in this category');

  return `Score ${score.toFixed(1)}/100 — ${parts.join(', ')}.`;
}

/**
 * Rank all volunteers for a need and return top N
 */
async function rankVolunteersForNeed(need, volunteers, allCompletedNeeds = [], topN = 5) {
  const scored = volunteers.map(volunteer => {
    const result = calculateMatchScore(volunteer, need, allCompletedNeeds);
    return {
      volunteerId: volunteer.id,
      volunteerName: volunteer.name,
      volunteerPhone: volunteer.phone,
      volunteerRating: volunteer.rating,
      volunteerLocation: volunteer.location,
      volunteerSkills: volunteer.skills,
      completedTasks: volunteer.completedTasks,
      responseRate: volunteer.responseRate,
      ...result,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

module.exports = {
  calculateMatchScore,
  calculateSkillFit,
  calculateAvailability,
  calculateLocationScore,
  calculateInterestScore,
  rankVolunteersForNeed,
  haversineDistance,
};
