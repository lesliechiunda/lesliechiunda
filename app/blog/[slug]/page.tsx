import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Header } from "../../components";
import { getBlogArticleBySlug } from "../../../lib/repository";
import ArticleView from "../ArticleView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = await getBlogArticleBySlug((await params).slug);
  if (!article) return { title: "Article not found", robots: { index: false } };
  const title = article.seoTitle ?? article.title;
  const description = `${article.seoDescription ?? article.excerpt} Published by Leslie Chiunda.`;
  const url = `/blog/${article.slug}`;
  const publishedTime = article.publishedAt ?? article.updatedAt;
  return {
    title,
    description,
    authors: [{ name: "Leslie Chiunda", url: "/#about" }],
    creator: "Leslie Chiunda",
    publisher: "Leslie Chiunda",
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: "Leslie Chiunda",
      title,
      description,
      publishedTime,
      authors: ["Leslie Chiunda"],
      images: article.coverImage ? [{ url: article.coverImage, alt: article.coverAlt }] : [],
    },
    twitter: { card: "summary_large_image", title, description, images: article.coverImage ? [article.coverImage] : [] },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getBlogArticleBySlug((await params).slug);
  if (!article) notFound();
  return <main className="blog-root"><Header /><ArticleView article={article} /><Footer /></main>;
}
