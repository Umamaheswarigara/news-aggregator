package com.newsaggregator.repository;

import com.newsaggregator.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    Page<Article> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Article> findBySourceId(Long sourceId, Pageable pageable);
    Page<Article> findByCategoryIdAndSourceId(Long categoryId, Long sourceId, Pageable pageable);
    Page<Article> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);
}
