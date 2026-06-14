import mongoose from 'mongoose';

const articleContentSchema = new mongoose.Schema({
  articleId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  fullContent: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  keywords: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const ArticleContent = mongoose.model('ArticleContent', articleContentSchema);
export default ArticleContent;
