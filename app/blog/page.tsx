/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Footer, Header } from "../components";
import { listBlogArticles } from "../../lib/repository";

export const metadata: Metadata = { title: "Blog", description: "Practical notes on websites, digital products, design and building useful systems." };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlogPage() {
  const articles = await listBlogArticles();
  return <main className="blog-root">
    <Header />
    <section className="blog-intro"><p className="kicker">Notes from the studio</p><h1>Ideas about useful<br /><em>digital work.</em></h1><p>Practical thinking on websites, products, design and the systems behind them.</p></section>
    <section className="blog-index" aria-label="Published articles">
      {articles.length ? <div className="blog-grid">{articles.map((article) => <a className="article-card" href={`/blog/${article.slug}`} key={article.id}>
        <div className="article-card-image">{article.coverImage ? <img src={`${article.coverImage}${article.coverObjectKey ? `?v=${encodeURIComponent(article.updatedAt)}` : ""}`} alt={article.coverAlt} /> : null}</div>
        <p>{article.category}</p><h2>{article.title}</h2><span>Read article ↗</span>
      </a>)}</div> : <div className="blog-empty"><p className="kicker">Coming soon</p><h2>Articles are being prepared.</h2><p>The first studio notes are currently in private review.</p></div>}
    </section>
    <Footer />
  </main>;
}
