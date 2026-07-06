/**
 * ChromaDB Client — Direct REST API with local embeddings
 *
 * Computes embeddings via @huggingface/transformers (all-MiniLM-L6-v2),
 * then sends them directly to the ChromaDB server REST API.
 * Cache is redirected to ai-cache/ (never .next) to avoid permission errors.
 */

import { env as TransformersEnv, pipeline } from '@huggingface/transformers';
import path from 'path';

// ── Cache redirect: keep model files out of .next ────────────────────────────
TransformersEnv.cacheDir = path.join(process.cwd(), 'ai-cache');

const CHROMA_URL  = process.env.CHROMA_URL || 'http://127.0.0.1:8000';
const CHROMA_BASE = `${CHROMA_URL}/api/v2/tenants/default_tenant/databases/default_database`;

// Singleton pipeline (loaded once per process)
let _pipe = null;
let _collectionId = null;

// ── Embedding pipeline ────────────────────────────────────────────────────────

async function getEmbedder() {
  if (_pipe) return _pipe;
  _pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'fp32' });
  return _pipe;
}

async function embed(texts) {
  const embedder = await getEmbedder();
  const output   = await embedder(texts, { pooling: 'mean', normalize: true });
  return output.tolist(); // [[...384 floats], ...]
}

// ── ChromaDB REST helpers ─────────────────────────────────────────────────────

async function chromaFetch(urlPath, options = {}) {
  const res = await fetch(`${CHROMA_BASE}${urlPath}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ChromaDB ${options.method || 'GET'} ${urlPath} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function getCollectionId() {
  if (_collectionId) return _collectionId;

  const cols = await chromaFetch('/collections?limit=100');
  const found = Array.isArray(cols) ? cols.find(c => c.name === 'candidates') : null;

  if (found) {
    _collectionId = found.id;
    return _collectionId;
  }

  // Create collection (server stores vectors, no server-side embedding needed)
  const created = await chromaFetch('/collections', {
    method: 'POST',
    body: JSON.stringify({
      name: 'candidates',
      metadata: { description: 'Student candidates for semantic recruitment search' },
    }),
  });
  _collectionId = created.id;
  return _collectionId;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Kept for API compatibility with existing routes */
export async function getCandidatesCollection() {
  await getCollectionId();
  return { _rest: true };
}

/**
 * Add or update a single candidate in ChromaDB
 */
export async function addCandidateToChroma(student) {
  try {
    const colId    = await getCollectionId();
    const text     = createCandidateEmbeddingText(student);
    const [vector] = await embed([text]);

    await chromaFetch(`/collections/${colId}/upsert`, {
      method: 'POST',
      body: JSON.stringify({
        ids:        [student._id.toString()],
        embeddings: [vector],
        documents:  [text],
        metadatas:  [buildMetadata(student)],
      }),
    });
    return true;
  } catch (error) {
    console.error('Error adding candidate to Chroma:', error);
    return false;
  }
}

/**
 * Batch sync all students to ChromaDB
 */
export async function syncAllCandidatesToChroma(students) {
  try {
    const colId = await getCollectionId();

    const ids       = [];
    const documents = [];
    const metadatas = [];

    for (const student of students) {
      ids.push(student._id.toString());
      documents.push(createCandidateEmbeddingText(student));
      metadatas.push(buildMetadata(student));
    }

    if (ids.length === 0) return { success: true, count: 0 };

    // Compute all embeddings in one batch
    console.log(` Computing embeddings for ${ids.length} candidates...`);
    const embeddings = await embed(documents);

    await chromaFetch(`/collections/${colId}/upsert`, {
      method: 'POST',
      body: JSON.stringify({ ids, embeddings, documents, metadatas }),
    });

    return { success: true, count: ids.length };
  } catch (error) {
    console.error('Error syncing candidates to Chroma:', error);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Semantic search — embed the query, then find nearest candidates
 */
export async function searchCandidatesInChroma({
  queryText,
  jobDescription = '',
  requiredSkills  = [],
  nResults        = 50,
  filters         = {},
}) {
  try {
    const colId = await getCollectionId();

    // Build query string
    let searchQuery = queryText || '';
    if (jobDescription)         searchQuery += ` ${jobDescription}`;
    if (requiredSkills.length)  searchQuery += ` Skills required: ${requiredSkills.join(', ')}`;
    searchQuery = searchQuery.trim();

    if (!searchQuery) return { ids: [], distances: [], metadatas: [], documents: [] };

    // Embed the query
    const [queryVector] = await embed([searchQuery]);

    const whereClause = buildWhereClause(filters);
    const body = {
      query_embeddings: [queryVector],
      n_results:        nResults,
      include:          ['metadatas', 'documents', 'distances'],
    };
    if (whereClause.length > 0) body.where = { $and: whereClause };

    const results = await chromaFetch(`/collections/${colId}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      ids:       results.ids?.[0]       || [],
      distances: results.distances?.[0] || [],
      metadatas: results.metadatas?.[0] || [],
      documents: results.documents?.[0] || [],
    };
  } catch (error) {
    console.error('Error searching in Chroma:', error);
    return { ids: [], distances: [], metadatas: [], documents: [] };
  }
}

/**
 * Delete a candidate from ChromaDB
 */
export async function deleteCandidateFromChroma(studentId) {
  try {
    const colId = await getCollectionId();
    await chromaFetch(`/collections/${colId}/delete`, {
      method: 'POST',
      body: JSON.stringify({ ids: [studentId.toString()] }),
    });
    return true;
  } catch (error) {
    console.error('Error deleting candidate from Chroma:', error);
    return false;
  }
}

/**
 * Get collection statistics
 */
export async function getChromaStats() {
  try {
    const colId = await getCollectionId();
    const count = await chromaFetch(`/collections/${colId}/count`);
    return { total_candidates: count, collection_name: 'candidates' };
  } catch (error) {
    console.error('Error getting Chroma stats:', error);
    return { total_candidates: 0, error: error.message };
  }
}

// ── Private helpers ───────────────────────────────────────────────────────────

function buildMetadata(student) {
  return {
    student_id:          student._id.toString(),
    name:                student.user_id?.name || 'Unknown',
    email:               student.user_id?.email || '',
    gpa:                 parseFloat(student.resume_parsed_data?.education?.gpa || 0),
    graduation_year:     parseInt(student.resume_parsed_data?.education?.graduation_year || 0),
    university:          student.resume_parsed_data?.education?.university || '',
    degree:              student.resume_parsed_data?.education?.degree || '',
    github_repos:        student.github_data?.repos_count || 0,
    location:            student.location || '',
    has_cultural_fitness: !!(student.cultural_fitness?.length > 0) || !!(student.gamified_assessment?.persona),
    retention_score:     student.retention_score || 0,
  };
}

function createCandidateEmbeddingText(student) {
  const parts = [];

  if (student.user_id?.name) parts.push(`Name: ${student.user_id.name}`);

  const edu = student.resume_parsed_data?.education || {};
  if (edu.degree)     parts.push(`Degree: ${edu.degree}`);
  if (edu.university) parts.push(`University: ${edu.university}`);
  if (edu.gpa)        parts.push(`GPA: ${edu.gpa}`);

  const skills = student.resume_parsed_data?.skills || [];
  if (skills.length)  parts.push(`Skills: ${skills.join(', ')}`);

  const exp = student.resume_parsed_data?.experience || [];
  if (exp.length) {
    const texts = exp
      .map(e => `${e.title || ''} at ${e.company || ''}: ${e.description || ''}`)
      .filter(Boolean);
    if (texts.length) parts.push(`Experience: ${texts.join('. ')}`);
  }

  const proj = student.resume_parsed_data?.projects || [];
  if (proj.length) {
    const texts = proj.map(p => `${p.name || ''}: ${p.description || ''}`).filter(Boolean);
    if (texts.length) parts.push(`Projects: ${texts.join('. ')}`);
  }

  if (student.achievements?.length) parts.push(`Achievements: ${student.achievements.join(', ')}`);

  if (student.interests?.length) {
    const list = Array.isArray(student.interests) ? student.interests : [student.interests];
    parts.push(`Interests: ${list.join(', ')}`);
  }

  if (student.location) parts.push(`Location: ${student.location}`);

  if (student.cultural_fitness?.length) {
    parts.push(`Cultural Traits: ${student.cultural_fitness.map(cf => `${cf.question}: ${cf.answer}`).join('. ')}`);
  }

  if (student.gamified_assessment?.persona) {
    parts.push(`Gamified Persona: ${student.gamified_assessment.persona}`);
    parts.push(`Gamified Traits: Pragmatism (${student.gamified_assessment.scores?.pragmatism || 0}), Teamwork (${student.gamified_assessment.scores?.teamwork || 0}), Innovation (${student.gamified_assessment.scores?.innovation || 0}), Leadership (${student.gamified_assessment.scores?.leadership || 0})`);
  }

  if (student.github_data?.repos_count) {
    parts.push(`GitHub Repositories: ${student.github_data.repos_count}`);
  }

  return parts.join(' | ');
}

function buildWhereClause(filters) {
  const c = [];
  if (filters.min_gpa)          c.push({ gpa:             { $gte: parseFloat(filters.min_gpa) } });
  if (filters.max_gpa)          c.push({ gpa:             { $lte: parseFloat(filters.max_gpa) } });
  if (filters.graduation_year)  c.push({ graduation_year: { $eq:  parseInt(filters.graduation_year) } });
  if (filters.university)       c.push({ university:      { $eq:  filters.university } });
  if (filters.degree)           c.push({ degree:          { $eq:  filters.degree } });
  if (filters.min_github_repos) c.push({ github_repos:    { $gte: parseInt(filters.min_github_repos) } });
  if (filters.location)         c.push({ location:        { $eq:  filters.location } });
  if (filters.has_cultural_fitness !== undefined) {
    c.push({ has_cultural_fitness: { $eq: filters.has_cultural_fitness } });
  }
  return c;
}
