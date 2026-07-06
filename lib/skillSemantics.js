// Semantic Skill Mapping - Related skills that should match
// This helps with skill matching when exact keywords don't match

export const skillRelations = {
  // Frontend Frameworks
  'react': ['nextjs', 'next.js', 'react.js', 'reactjs', 'gatsby', 'remix'],
  'nextjs': ['react', 'react.js', 'reactjs'],
  'next.js': ['react', 'react.js', 'reactjs'],
  'vue': ['nuxt', 'nuxt.js', 'vuejs', 'vue.js'],
  'angular': ['angularjs', 'angular.js'],
  
  // Backend Frameworks
  'nodejs': ['node.js', 'node', 'express', 'expressjs', 'nestjs', 'koa'],
  'node.js': ['nodejs', 'node', 'express', 'expressjs', 'nestjs', 'koa'],
  'express': ['nodejs', 'node.js', 'expressjs'],
  'django': ['python', 'flask', 'fastapi'],
  'flask': ['python', 'django', 'fastapi'],
  'spring': ['java', 'spring boot', 'springboot'],
  
  // Databases
  'mongodb': ['mongoose', 'nosql', 'database'],
  'mysql': ['sql', 'database', 'mariadb', 'postgresql', 'postgres'],
  'postgresql': ['sql', 'database', 'postgres', 'mysql'],
  'sql': ['mysql', 'postgresql', 'sqlite', 'database'],
  
  // Programming Languages
  'javascript': ['js', 'typescript', 'nodejs', 'react', 'vue', 'angular'],
  'typescript': ['javascript', 'js', 'ts'],
  'python': ['django', 'flask', 'fastapi', 'pandas', 'numpy'],
  'java': ['spring', 'spring boot', 'hibernate'],
  
  // Cloud & DevOps
  'aws': ['amazon web services', 'ec2', 's3', 'lambda', 'cloud'],
  'azure': ['microsoft azure', 'cloud'],
  'docker': ['containerization', 'kubernetes', 'devops'],
  'kubernetes': ['k8s', 'docker', 'devops', 'container orchestration'],
  
  // Mobile
  'react native': ['react', 'mobile development', 'ios', 'android'],
  'flutter': ['dart', 'mobile development', 'ios', 'android'],
  
  // Tools & Others
  'git': ['github', 'gitlab', 'version control'],
  'rest api': ['api', 'restful', 'http'],
  'graphql': ['api', 'apollo'],
};

/**
 * Calculate semantic skill match score
 * @param {Array} requiredSkills - Skills required by the job
 * @param {Array} candidateSkills - Skills possessed by candidate
 * @returns {Object} - Match details with score and matched skills
 */
export function calculateSemanticSkillMatch(requiredSkills, candidateSkills) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { score: 0, matchedSkills: [], unmatchedSkills: requiredSkills };
  }

  const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase().trim());
  const matchedSkills = [];
  const unmatchedSkills = [];

  requiredSkills.forEach(requiredSkill => {
    const normalizedRequired = requiredSkill.toLowerCase().trim();
    let isMatched = false;

    // 1. Direct exact match
    if (normalizedCandidateSkills.some(cs => cs === normalizedRequired)) {
      matchedSkills.push(requiredSkill);
      isMatched = true;
      return;
    }

    // 2. Partial string match (e.g., "react" in "react.js")
    if (normalizedCandidateSkills.some(cs => 
      cs.includes(normalizedRequired) || normalizedRequired.includes(cs)
    )) {
      matchedSkills.push(requiredSkill);
      isMatched = true;
      return;
    }

    // 3. Semantic match using skill relations
    const relatedSkills = skillRelations[normalizedRequired] || [];
    if (relatedSkills.some(related => 
      normalizedCandidateSkills.some(cs => 
        cs.includes(related.toLowerCase()) || related.toLowerCase().includes(cs)
      )
    )) {
      matchedSkills.push(requiredSkill);
      isMatched = true;
      return;
    }

    // 4. Reverse check - if candidate has a skill that's related to required skill
    for (const candidateSkill of normalizedCandidateSkills) {
      const candidateRelations = skillRelations[candidateSkill] || [];
      if (candidateRelations.some(rel => 
        rel.toLowerCase() === normalizedRequired || 
        normalizedRequired.includes(rel.toLowerCase())
      )) {
        matchedSkills.push(requiredSkill);
        isMatched = true;
        break;
      }
    }

    if (!isMatched) {
      unmatchedSkills.push(requiredSkill);
    }
  });

  const score = (matchedSkills.length / requiredSkills.length) * 100;

  return {
    score: Math.round(score),
    matchedSkills,
    unmatchedSkills,
    totalRequired: requiredSkills.length,
    totalMatched: matchedSkills.length
  };
}

/**
 * Get explanation for why a skill matched
 * @param {string} requiredSkill - Required skill
 * @param {Array} candidateSkills - Candidate's skills
 * @returns {string} - Explanation
 */
export function getSkillMatchExplanation(requiredSkill, candidateSkills) {
  const normalized = requiredSkill.toLowerCase().trim();
  const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase().trim());

  // Direct match
  const directMatch = candidateSkills.find(cs => cs.toLowerCase() === normalized);
  if (directMatch) {
    return `Direct match: "${directMatch}"`;
  }

  // Partial match
  const partialMatch = candidateSkills.find(cs => 
    cs.toLowerCase().includes(normalized) || normalized.includes(cs.toLowerCase())
  );
  if (partialMatch) {
    return `Related skill: "${partialMatch}"`;
  }

  // Semantic match
  const relatedSkills = skillRelations[normalized] || [];
  for (const related of relatedSkills) {
    const semanticMatch = candidateSkills.find(cs => 
      cs.toLowerCase().includes(related.toLowerCase())
    );
    if (semanticMatch) {
      return `Semantically related: "${semanticMatch}" (similar to ${requiredSkill})`;
    }
  }

  return 'No match';
}
