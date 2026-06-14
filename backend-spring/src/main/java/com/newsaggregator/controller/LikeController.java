package com.newsaggregator.controller;

import com.newsaggregator.model.Article;
import com.newsaggregator.model.Like;
import com.newsaggregator.model.User;
import com.newsaggregator.repository.ArticleRepository;
import com.newsaggregator.repository.LikeRepository;
import com.newsaggregator.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/likes")
public class LikeController {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArticleRepository articleRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    public record LikeRequest(Long articleId) {}

    @GetMapping("/count/{articleId}")
    public ResponseEntity<?> getLikeCount(@PathVariable Long articleId) {
        long count = likeRepository.countByArticleId(articleId);
        return ResponseEntity.ok(java.util.Collections.singletonMap("count", count));
    }

    @GetMapping("/status/{articleId}")
    public ResponseEntity<?> getLikeStatus(@PathVariable Long articleId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.ok(java.util.Collections.singletonMap("liked", false));
        }
        boolean liked = likeRepository.existsByUserIdAndArticleId(user.getId(), articleId);
        return ResponseEntity.ok(java.util.Collections.singletonMap("liked", liked));
    }

    @PostMapping
    public ResponseEntity<?> toggleLike(@RequestBody LikeRequest req) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        Optional<Article> articleOpt = articleRepository.findById(req.articleId());
        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Article article = articleOpt.get();
        Optional<Like> existing = likeRepository.findByUserIdAndArticleId(user.getId(), article.getId());

        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            long count = likeRepository.countByArticleId(article.getId());
            return ResponseEntity.ok(java.util.Map.of("status", "unliked", "count", count));
        } else {
            Like like = new Like(user, article);
            likeRepository.save(like);
            long count = likeRepository.countByArticleId(article.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(java.util.Map.of("status", "liked", "count", count));
        }
    }
}
