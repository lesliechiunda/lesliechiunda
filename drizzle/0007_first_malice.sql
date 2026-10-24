CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`client_name` text NOT NULL,
	`client_email` text DEFAULT '' NOT NULL,
	`client_address` text DEFAULT '' NOT NULL,
	`issue_date` text NOT NULL,
	`due_date` text NOT NULL,
	`line_items` text DEFAULT '[]' NOT NULL,
	`subtotal_cents` integer DEFAULT 0 NOT NULL,
	`tax_percent` integer DEFAULT 0 NOT NULL,
	`tax_cents` integer DEFAULT 0 NOT NULL,
	`total_cents` integer DEFAULT 0 NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_number_unique` ON `invoices` (`number`);--> statement-breakpoint
CREATE INDEX `idx_invoices_issue_date` ON `invoices` (`issue_date`);