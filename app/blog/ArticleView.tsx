/* eslint-disable @next/next/no-img-element */
import type { BlogArticleRecord } from "../../lib/repository";

export default function ArticleView({ article, draft = false }: { article: BlogArticleRecord; draft?: boolean }) {
  const sections = article.body.split(/\n\s*\n/).map((section) => section.trim()).filter(Boolean);
  const date = article.publishedAt ?? article.updatedAt;
  return <article className="article-page">
    <header className="article-hero">
      {draft ? <span className="draft-ribbon">Private draft preview</span> : null}
      <p className="article-category">{article.category}</p>
      <h1>{article.title}</h1>
      <p className="article-deck">{article.excerpt}</p>
      <time dateTime={date}>{new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date))}</time>
    </header>
    {article.coverImage ? <figure className="article-lead-image"><img src={`${article.coverImage}${article.coverObjectKey ? `?v=${encodeURIComponent(article.updatedAt)}` : ""}`} alt={article.coverAlt} /></figure> : null}
    <div className="article-body">{sections.map((section, index) => section.startsWith("## ") ? <h2 key={index}>{section.slice(3)}</h2> : <p key={index}>{section}</p>)}</div>
  </article>;
}
