import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Header } from "../../components";
import { getBlogArticleBySlug } from "../../../lib/repository";
import ArticleView from "../ArticleView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = await getBlogArticleBySlug((await params).slug);
  if (!article) return { title: "Article not found", robots: { index: false } };
  return { title: article.seoTitle ?? article.title, description: article.seoDescription ?? article.excerpt, openGraph: { title: article.seoTitle ?? article.title, description: article.seoDescription ?? article.excerpt, images: article.coverImage ? [{ url: article.coverImage, alt: article.coverAlt }] : [] } };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getBlogArticleBySlug((await params).slug);
  if (!article) notFound();
  return <main className="blog-root"><Header /><ArticleView article={article} /><Footer /></main>;
}
