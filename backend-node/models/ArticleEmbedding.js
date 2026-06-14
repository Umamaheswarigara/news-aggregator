import mongoose from 'mongoose';

const articleEmbeddingSchema = new mongoose.Schema({
  articleId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  embedding: {
    type: [Number],
    required: true
  }
});

const ArticleEmbedding = mongoose.model('ArticleEmbedding', articleEmbeddingSchema);
export default ArticleEmbedding;
