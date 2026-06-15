import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import ArticleContent from './models/ArticleContent.js';
import ArticleEmbedding from './models/ArticleEmbedding.js';
import ReadingActivity from './models/ReadingActivity.js';
import { getEmbedding, cosineSimilarity, initEmbeddingModel } from './utils/embedding.js';
import { authenticateToken, requireAdmin } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI environment variable is not defined. Running without MongoDB connection.");
} else {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB.");
      // Warm up the embedding model on server startup
      initEmbeddingModel().catch(err => console.error("Failed to initialize embedding model on startup:", err));
    })
    .catch(err => console.error("MongoDB connection error:", err));
}

// 1. GET detailed content of an article
app.get('/api/v1/content/:articleId', async (req, res) => {
  try {
    const articleId = parseInt(req.params.articleId);
    if (isNaN(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }
    const content = await ArticleContent.findOne({ articleId });
    if (!content) {
      return res.status(404).json({ message: "Article content not found" });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Helper to extract keywords from text
function extractKeywords(text, count = 5) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 4); // Filter short words
  
  const stopwords = new Set(['about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves']);
  
  const freq = {};
  for (const w of words) {
    if (!stopwords.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  
  return Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, count);
}

// 2. POST create detailed article content (Admin only)
app.post('/api/v1/content', requireAdmin, async (req, res) => {
  try {
    const { articleId, fullContent, title } = req.body;
    let { summary, keywords } = req.body;
    
    if (!articleId || !fullContent || !title) {
      return res.status(400).json({ message: "Missing required fields (articleId, fullContent, title)" });
    }

    // Auto-generate summary if not provided
    if (!summary) {
      summary = fullContent.split(/[.!?]/).slice(0, 2).join('. ').trim();
      if (summary) summary += '.';
      if (!summary) summary = title;
    }

    // Auto-generate keywords if not provided
    if (!keywords || keywords.length === 0) {
      keywords = extractKeywords(fullContent, 5);
    }

    // Save Content
    await ArticleContent.findOneAndUpdate(
      { articleId },
      { fullContent, summary, keywords },
      { upsert: true, new: true }
    );

    // Generate and save embedding (combine title and content for better representation)
    const embeddingText = `${title}. ${summary} ${fullContent.slice(0, 500)}`;
    const vector = await getEmbedding(embeddingText);

    await ArticleEmbedding.findOneAndUpdate(
      { articleId },
      { embedding: vector },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Article content and embeddings created/updated successfully." });
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. PUT update detailed article content (Admin only)
app.put('/api/v1/content/:articleId', requireAdmin, async (req, res) => {
  try {
    const articleId = parseInt(req.params.articleId);
    const { fullContent, title } = req.body;
    let { summary, keywords } = req.body;
    
    if (isNaN(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }
    if (!fullContent || !title) {
      return res.status(400).json({ message: "Missing fullContent or title" });
    }

    // Auto-generate summary and keywords if missing
    if (!summary) {
      summary = fullContent.split(/[.!?]/).slice(0, 2).join('. ').trim();
      if (summary) summary += '.';
      if (!summary) summary = title;
    }
    if (!keywords || keywords.length === 0) {
      keywords = extractKeywords(fullContent, 5);
    }

    await ArticleContent.findOneAndUpdate(
      { articleId },
      { fullContent, summary, keywords },
      { new: true }
    );

    // Re-generate embedding
    const embeddingText = `${title}. ${summary} ${fullContent.slice(0, 500)}`;
    const vector = await getEmbedding(embeddingText);

    await ArticleEmbedding.findOneAndUpdate(
      { articleId },
      { embedding: vector }
    );

    res.json({ message: "Article content and embeddings updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 4. DELETE detailed article content (Admin only)
app.delete('/api/v1/content/:articleId', requireAdmin, async (req, res) => {
  try {
    const articleId = parseInt(req.params.articleId);
    if (isNaN(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    await ArticleContent.findOneAndDelete({ articleId });
    await ArticleEmbedding.findOneAndDelete({ articleId });

    res.json({ message: "Article content and embeddings deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 5. GET Semantic Search (AI Search)
app.get('/api/v1/semantic-search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query 'q' is required" });
    }

    // 1. Generate embedding for query
    const queryVector = await getEmbedding(query);

    // 2. Load all embeddings from MongoDB (since it is local development)
    const allEmbeddings = await ArticleEmbedding.find({});
    
    // 3. Compute cosine similarity in memory
    const results = allEmbeddings.map(doc => {
      const score = cosineSimilarity(queryVector, doc.embedding);
      return {
        articleId: doc.articleId,
        score: score
      };
    });

    // 4. Sort descending and filter top results
    // We sort by score descending and take the top 15 matches
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    res.json({ results: sortedResults });
  } catch (error) {
    console.error("Semantic search error:", error);
    res.status(500).json({ message: "AI search error", error: error.message });
  }
});

// 6. POST log reading history
app.post('/api/v1/reading-history', authenticateToken, async (req, res) => {
  try {
    const { articleId, readingDuration } = req.body;
    const userId = req.user.id;

    if (!articleId) {
      return res.status(400).json({ message: "articleId is required" });
    }

    const activity = new ReadingActivity({
      userId,
      articleId,
      readingDuration: readingDuration || 0
    });

    await activity.save();
    res.status(201).json({ message: "Reading history saved successfully", activity });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 7. GET user reading history and stats
app.get('/api/v1/reading-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await ReadingActivity.find({ userId })
      .sort({ readTime: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 8. GET reading stats
app.get('/api/v1/reading-history/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await ReadingActivity.aggregate([
      { $match: { userId: userId } },
      { 
        $group: {
          _id: null,
          totalArticles: { $addToSet: "$articleId" },
          totalDuration: { $sum: "$readingDuration" },
          totalVisits: { $sum: 1 }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        totalArticlesRead: 0,
        totalDurationMinutes: 0,
        totalVisits: 0
      });
    }

    res.json({
      totalArticlesRead: stats[0].totalArticles.length,
      totalDurationMinutes: Math.round(stats[0].totalDuration / 60),
      totalVisits: stats[0].totalVisits
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Node.js server running on port ${PORT}`);
});
