CREATE TABLE `agent_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text,
	`job_type` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	`result` text,
	`requires_approval` integer DEFAULT true NOT NULL,
	`approved_at` text,
	`executed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_agent_jobs_status` ON `agent_jobs` (`status`,`requires_approval`);--> statement-breakpoint
CREATE TABLE `approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`kind` text NOT NULL,
	`decision` text DEFAULT 'pending' NOT NULL,
	`requested_by` text DEFAULT 'system' NOT NULL,
	`decided_by` text,
	`decided_at` text,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_approvals_business_id` ON `approvals` (`business_id`);--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`industry` text DEFAULT 'Other' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`website` text,
	`website_status` text DEFAULT 'none' NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`preview_status` text DEFAULT 'not_started' NOT NULL,
	`preview_url` text,
	`outreach_status` text DEFAULT 'not_started' NOT NULL,
	`approval_status` text DEFAULT 'needs_review' NOT NULL,
	`priority` integer DEFAULT 2 NOT NULL,
	`contact_name` text,
	`contact_email` text,
	`contact_phone` text,
	`notes` text DEFAULT '' NOT NULL,
	`last_activity_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `businesses_slug_unique` ON `businesses` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_businesses_review_queue` ON `businesses` (`approval_status`,`preview_status`);--> statement-breakpoint
CREATE INDEX `idx_businesses_outreach_status` ON `businesses` (`outreach_status`);--> statement-breakpoint
CREATE INDEX `idx_businesses_updated_at` ON `businesses` (`updated_at`);--> statement-breakpoint
CREATE TABLE `outreach_events` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`channel` text DEFAULT 'email' NOT NULL,
	`status` text NOT NULL,
	`subject` text,
	`body` text,
	`external_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_outreach_events_business_id` ON `outreach_events` (`business_id`);