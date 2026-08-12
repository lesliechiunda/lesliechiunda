/* eslint-disable @next/next/no-img-element */
import type { BlogArticleRecord } from "../../lib/repository";
import ArticleEngagement from "./ArticleEngagement";

export default function ArticleView({ article, draft = false }: { article: BlogArticleRecord; draft?: boolean }) {
  const sections = article.body.split(/\n\s*\n/).map((section) => section.trim()).filter(Boolean);
  const date = article.publishedAt ?? article.updatedAt;
  const formatted = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" }).format(new Date(date));
  return <article className="article-page">
    <header className="article-hero">
      {draft ? <span className="draft-ribbon">Private draft preview</span> : null}
      <p className="article-category">{article.category}</p>
      <h1>{article.title}</h1>
      <p className="article-deck">{article.excerpt}</p>
      <div className="article-byline"><img src="/leslie.jpg" alt="" /><p>Published by <strong>Leslie Chiunda</strong><time dateTime={date}>{formatted} SAST</time></p></div>
      {!draft ? <ArticleEngagement articleId={article.id} title={article.title} /> : null}
    </header>
    {article.coverImage ? <figure className="article-lead-image"><img src={`${article.coverImage}${article.coverObjectKey ? `?v=${encodeURIComponent(article.updatedAt)}` : ""}`} alt={article.coverAlt} /></figure> : null}
    <div className="article-body">{sections.map((section, index) => section.startsWith("## ") ? <h2 key={index}>{section.slice(3)}</h2> : <p key={index}>{section}</p>)}</div>
  </article>;
}
