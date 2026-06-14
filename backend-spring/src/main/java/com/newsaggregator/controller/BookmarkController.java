package com.newsaggregator.controller;

import com.newsaggregator.model.Article;
import com.newsaggregator.model.Bookmark;
import com.newsaggregator.model.User;
import com.newsaggregator.repository.ArticleRepository;
import com.newsaggregator.repository.BookmarkRepository;
import com.newsaggregator.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/bookmarks")
public class BookmarkController {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArticleRepository articleRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    public record BookmarkRequest(Long articleId) {}

    @GetMapping
    public ResponseEntity<?> getUserBookmarks() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        List<Bookmark> bookmarks = bookmarkRepository.findByUserId(user.getId());
        return ResponseEntity.ok(bookmarks);
    }

    @PostMapping
    public ResponseEntity<?> toggleBookmark(@RequestBody BookmarkRequest req) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        Optional<Article> articleOpt = articleRepository.findById(req.articleId());
        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Article article = articleOpt.get();
        Optional<Bookmark> existing = bookmarkRepository.findByUserIdAndArticleId(user.getId(), article.getId());

        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            return ResponseEntity.ok("{\"status\": \"removed\", \"message\": \"Bookmark removed successfully\"}");
        } else {
            Bookmark bookmark = new Bookmark(user, article);
            bookmarkRepository.save(bookmark);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("{\"status\": \"added\", \"message\": \"Bookmark added successfully\"}");
        }
    }
}
