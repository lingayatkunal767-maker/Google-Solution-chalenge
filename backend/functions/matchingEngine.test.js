// backend/functions/matchingEngine.test.js

const {
  calculateSkillFit,
  calculateAvailability,
  calculateLocationScore,
  calculateMatchScore,
  rankVolunteersForNeed,
  haversineDistance,
} = require('./matchingEngine');

// ── haversineDistance ──────────────────────────────────────────────────────────
describe('haversineDistance', () => {
  test('same location returns 0', () => {
    expect(haversineDistance(18.5, 73.8, 18.5, 73.8)).toBe(0);
  });

  test('Pune to Mumbai ≈ 120km', () => {
    const dist = haversineDistance(18.5204, 73.8567, 19.0760, 72.8777);
    expect(dist).toBeGreaterThan(110);
    expect(dist).toBeLessThan(135);
  });
});

// ── calculateSkillFit ─────────────────────────────────────────────────────────
describe('calculateSkillFit', () => {
  test('full match returns 100', () => {
    expect(calculateSkillFit(['medical', 'first-aid'], ['medical', 'first-aid'])).toBe(100);
  });

  test('partial match returns proportional score', () => {
    expect(calculateSkillFit(['medical'], ['medical', 'first-aid', 'rescue'])).toBe(33);
  });

  test('no required skills returns 100', () => {
    expect(calculateSkillFit(['medical'], [])).toBe(100);
  });

  test('no matching skills returns 0', () => {
    expect(calculateSkillFit(['cooking'], ['medical', 'first-aid'])).toBe(0);
  });

  test('case-insensitive matching', () => {
    expect(calculateSkillFit(['Medical', 'FIRST-AID'], ['medical', 'first-aid'])).toBe(100);
  });
});

// ── calculateAvailability ─────────────────────────────────────────────────────
describe('calculateAvailability', () => {
  test('planned urgency with basic availability returns positive score', () => {
    const avail = { weekdays: true, weekends: false, flexibleHours: [] };
    const score = calculateAvailability(avail, 'planned');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('no availability returns low score', () => {
    const avail = { weekdays: false, weekends: false, flexibleHours: [] };
    const score = calculateAvailability(avail, 'immediate');
    expect(score).toBeLessThan(40);
  });

  test('full availability for immediate urgency returns high score', () => {
    const avail = { weekdays: true, weekends: true, flexibleHours: [{ startTime: '9:00', endTime: '20:00' }] };
    const score = calculateAvailability(avail, 'immediate');
    expect(score).toBeGreaterThanOrEqual(70);
  });
});

// ── calculateLocationScore ────────────────────────────────────────────────────
describe('calculateLocationScore', () => {
  test('same location returns 100', () => {
    const loc = { lat: 18.52, lng: 73.85 };
    expect(calculateLocationScore(loc, loc)).toBe(100);
  });

  test('within 5km returns 100', () => {
    const vol = { lat: 18.5204, lng: 73.8567 };
    const need = { lat: 18.5250, lng: 73.8600 }; // ~0.6km away
    expect(calculateLocationScore(vol, need)).toBe(100);
  });

  test('50km+ returns 0', () => {
    const vol = { lat: 18.5204, lng: 73.8567 }; // Pune
    const need = { lat: 19.0760, lng: 72.8777 }; // Mumbai
    expect(calculateLocationScore(vol, need)).toBe(0);
  });

  test('missing coordinates returns 50', () => {
    expect(calculateLocationScore({}, { lat: 18.52, lng: 73.85 })).toBe(50);
  });
});

// ── calculateMatchScore ───────────────────────────────────────────────────────
describe('calculateMatchScore', () => {
  const volunteer = {
    skills: ['medical', 'first-aid'],
    availability: { weekdays: true, weekends: true, flexibleHours: [] },
    location: { lat: 18.5204, lng: 73.8567 },
    pastTasks: [],
    rating: 4.5,
  };

  const need = {
    requiredSkills: ['medical', 'first-aid'],
    urgency: 'urgent',
    location: { lat: 18.5250, lng: 73.8600 },
    category: 'medical',
  };

  test('returns score between 0 and 100', () => {
    const { score } = calculateMatchScore(volunteer, need);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('returns scoreBreakdown with 4 components', () => {
    const { scoreBreakdown } = calculateMatchScore(volunteer, need);
    expect(scoreBreakdown).toHaveProperty('skillFit');
    expect(scoreBreakdown).toHaveProperty('availability');
    expect(scoreBreakdown).toHaveProperty('location');
    expect(scoreBreakdown).toHaveProperty('interest');
  });

  test('returns human-readable explanation', () => {
    const { explanation } = calculateMatchScore(volunteer, need);
    expect(typeof explanation).toBe('string');
    expect(explanation.length).toBeGreaterThan(10);
  });

  test('perfect volunteer scores above 80', () => {
    const { score } = calculateMatchScore(volunteer, need);
    expect(score).toBeGreaterThan(60); // has good skills + location
  });

  test('formula weights: (SkillFit×0.4) + (Avail×0.3) + (Loc×0.2) + (Interest×0.1)', () => {
    const { score, scoreBreakdown } = calculateMatchScore(volunteer, need);
    const expected =
      scoreBreakdown.skillFit * 0.4 +
      scoreBreakdown.availability * 0.3 +
      scoreBreakdown.location * 0.2 +
      scoreBreakdown.interest * 0.1;
    expect(score).toBeCloseTo(expected, 0);
  });
});

// ── rankVolunteersForNeed ─────────────────────────────────────────────────────
describe('rankVolunteersForNeed', () => {
  const need = {
    requiredSkills: ['medical'],
    urgency: 'urgent',
    location: { lat: 18.52, lng: 73.85 },
    category: 'medical',
  };

  const volunteers = [
    { id: 'v1', name: 'Alice', skills: ['medical', 'first-aid'],
      availability: { weekdays: true, weekends: true, flexibleHours: [] },
      location: { lat: 18.52, lng: 73.85 }, pastTasks: [], rating: 4.9 },
    { id: 'v2', name: 'Bob', skills: ['cooking'],
      availability: { weekdays: false, weekends: false, flexibleHours: [] },
      location: { lat: 20.0, lng: 77.0 }, pastTasks: [], rating: 3.0 },
    { id: 'v3', name: 'Carol', skills: ['medical'],
      availability: { weekdays: true, weekends: false, flexibleHours: [] },
      location: { lat: 18.53, lng: 73.86 }, pastTasks: [], rating: 4.2 },
  ];

  test('returns top N volunteers sorted by score desc', async () => {
    const results = await rankVolunteersForNeed(need, volunteers, [], 3);
    expect(results.length).toBeLessThanOrEqual(3);
    // Scores should be descending
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
    }
  });

  test('best-fit volunteer ranked first', async () => {
    const results = await rankVolunteersForNeed(need, volunteers, [], 3);
    expect(results[0].volunteerName).toBe('Alice');
  });

  test('limits results to topN', async () => {
    const results = await rankVolunteersForNeed(need, volunteers, [], 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  test('empty volunteer list returns empty array', async () => {
    const results = await rankVolunteersForNeed(need, [], [], 5);
    expect(results).toHaveLength(0);
  });
});
