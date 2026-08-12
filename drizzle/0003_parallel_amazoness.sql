CREATE TABLE `blog_articles` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`category` text DEFAULT 'Studio notes' NOT NULL,
	`cover_image` text,
	`cover_alt` text DEFAULT '' NOT NULL,
	`cover_object_key` text,
	`cover_content_type` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_articles_slug_unique` ON `blog_articles` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_blog_articles_status_order` ON `blog_articles` (`status`,`sort_order`);
