ALTER TABLE `businesses` ADD `featured` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `portfolio_projects` ADD `featured` integer DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE `businesses` SET `featured` = true WHERE `id` = 'biz_don_armando';--> statement-breakpoint
UPDATE `portfolio_projects` SET `featured` = true WHERE `id` IN ('project_finlit', 'project_remember_us', 'project_kahari_beauty');
