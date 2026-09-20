/**
 * API Service Layer for Memory Management Simulator
 * Centralizes all communication with the FastAPI backend.
 */

const API_BASE = '/api';

/**
 * Helper to process response and extract data or friendly error message.
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    let errorMsg = `Server returned HTTP ${response.status}`;
    if (data) {
      if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        // Pydantic validation errors list
        errorMsg = data.detail.map(d => `${d.loc?.slice(-1)[0] || 'field'}: ${d.msg}`).join(', ');
      } else if (data.message) {
        errorMsg = data.message;
      }
    }
    throw new Error(errorMsg);
  }

  // Backend wraps payload in APIResponse: { status, message, data }
  return data?.data !== undefined ? data.data : data;
}

/**
 * Generic request wrapper with offline / connection failure handling.
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const res = await fetch(url, config);
    return await handleResponse(res);
  } catch (err) {
    // Check if network connection failed (backend offline)
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      throw new Error(
        'Cannot connect to the simulation backend. Please ensure FastAPI is running on port 8000.'
      );
    }
    throw err;
  }
}

export const api = {
  /**
   * Health check endpoint
   */
  async checkHealth() {
    return apiRequest('/health', { method: 'GET' });
  },

  /**
   * Single address translation using Paging
   */
  async translatePaging(params) {
    return apiRequest('/translate/paging', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Single address translation using Segmentation
   */
  async translateSegmentation(params) {
    return apiRequest('/translate/segmentation', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Deterministic workload generation
   */
  async generateWorkload(params) {
    return apiRequest('/workloads/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Full reference sequence simulation for Paging
   */
  async simulatePaging(params) {
    return apiRequest('/simulate/paging', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Full reference sequence simulation for Segmentation
   */
  async simulateSegmentation(params) {
    return apiRequest('/simulate/segmentation', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Head-to-head comparison running BOTH techniques on the EXACT SAME WORKLOAD
   */
  async runComparison(params) {
    return apiRequest('/experiments/compare', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Configurable experiments
   */
  async runExperiment(params) {
    return apiRequest('/experiments/run', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

export default api;
