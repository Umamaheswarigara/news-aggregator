package com.newsaggregator.controller;

import com.newsaggregator.model.Article;
import com.newsaggregator.model.Category;
import com.newsaggregator.model.Source;
import com.newsaggregator.repository.ArticleRepository;
import com.newsaggregator.repository.CategoryRepository;
import com.newsaggregator.repository.SourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/articles")
public class ArticleController {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private SourceRepository sourceRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    public record ArticleRequest(String title, Long sourceId, Long categoryId) {}

    @GetMapping
    public ResponseEntity<?> getArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long sourceId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) java.util.List<Long> ids
    ) {
        if (ids != null && !ids.isEmpty()) {
            return ResponseEntity.ok(articleRepository.findAllById(ids));
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Article> articlePage;

        if (categoryId != null && sourceId != null) {
            articlePage = articleRepository.findByCategoryIdAndSourceId(categoryId, sourceId, pageable);
        } else if (categoryId != null) {
            articlePage = articleRepository.findByCategoryId(categoryId, pageable);
        } else if (sourceId != null) {
            articlePage = articleRepository.findBySourceId(sourceId, pageable);
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            articlePage = articleRepository.findByTitleContainingIgnoreCase(keyword.trim(), pageable);
        } else {
            articlePage = articleRepository.findAll(pageable);
        }

        return ResponseEntity.ok(articlePage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Article> getArticleById(@PathVariable Long id) {
        return articleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createArticle(@RequestBody ArticleRequest req) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Admin role required");
        }

        Optional<Source> sourceOpt = sourceRepository.findById(req.sourceId());
        Optional<Category> categoryOpt = categoryRepository.findById(req.categoryId());

        if (sourceOpt.isEmpty() || categoryOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid Source ID or Category ID");
        }

        Article article = new Article(req.title(), sourceOpt.get(), categoryOpt.get());
        Article saved = articleRepository.save(article);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateArticle(@PathVariable Long id, @RequestBody ArticleRequest req) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Admin role required");
        }

        Optional<Article> articleOpt = articleRepository.findById(id);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Source> sourceOpt = sourceRepository.findById(req.sourceId());
        Optional<Category> categoryOpt = categoryRepository.findById(req.categoryId());

        if (sourceOpt.isEmpty() || categoryOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid Source ID or Category ID");
        }

        Article article = articleOpt.get();
        article.setTitle(req.title());
        article.setSource(sourceOpt.get());
        article.setCategory(categoryOpt.get());

        Article updated = articleRepository.save(article);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Admin role required");
        }

        if (!articleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        articleRepository.deleteById(id);
        return ResponseEntity.ok("Article deleted successfully");
    }
}
