import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../../lib/admin-auth";
import { getBlogArticleById } from "../../../../lib/repository";
import ArticleView from "../../../blog/ArticleView";
import "../../../blog/blog.css";

export const metadata: Metadata = { title: "Draft article preview", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ArticleDraftPreview({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(`/admin/article-preview/${(await params).id}`);
  const article = await getBlogArticleById((await params).id);
  if (!article) notFound();
  return <main className="blog-root"><div className="draft-preview-bar"><a href="/admin#articles">← Back to admin</a><span>This page is visible only to an authorised admin.</span></div><ArticleView article={article} draft /></main>;
}
