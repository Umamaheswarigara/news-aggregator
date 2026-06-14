import { pipeline } from '@xenova/transformers';

let extractor = null;

// Initialize the feature extraction pipeline
export async function initEmbeddingModel() {
  if (!extractor) {
    console.log("Initializing local embedding model (Xenova/all-MiniLM-L6-v2)...");
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log("Embedding model loaded successfully.");
  }
}

// Generate embedding vector
export async function getEmbedding(text) {
  await initEmbeddingModel();
  
  // Extract features
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  
  // Convert output tensor data to a standard JS Array
  return Array.from(output.data);
}

// Calculate cosine similarity of two normalized vectors (dot product)
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}
