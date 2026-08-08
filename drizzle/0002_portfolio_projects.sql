CREATE TABLE `portfolio_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category` text DEFAULT 'Website' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`href` text NOT NULL,
	`image` text,
	`tone` text DEFAULT 'lime' NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_portfolio_projects_order` ON `portfolio_projects` (`published`,`sort_order`);
