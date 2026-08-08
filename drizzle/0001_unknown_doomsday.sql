CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`object_key` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`alt_text` text DEFAULT '' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_object_key_unique` ON `media_assets` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_media_assets_business_id` ON `media_assets` (`business_id`);--> statement-breakpoint
ALTER TABLE `businesses` ADD `eyebrow` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `businesses` ADD `headline` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `businesses` ADD `summary` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `businesses` ADD `services` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `businesses` ADD `hero_asset_id` text;