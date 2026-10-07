import { Page, expect } from '@playwright/test';
import { Priority } from '../support/tasks-api';
export class TasksPage {
 constructor(readonly page: Page, readonly workspace: string) {}
 async open() { await this.page.goto(`/?workspace=${this.workspace}`); await expect(this.page.getByRole('status')).toContainText('total'); }
 rows() { return this.page.getByTestId('task'); }
 row(title: string) { return this.rows().filter({ has: this.page.getByTestId('task-title').filter({ hasText: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }) }); }
 async add(title: string, priority: Priority = 'Medium') {
  await this.page.getByLabel('Task title', { exact: true }).fill(title);
  await this.page.getByLabel('Priority', { exact: true }).selectOption(priority);
  await this.page.getByRole('button', { name: 'Add task', exact: true }).click();
 }
 async complete(title: string) { await this.row(title).getByRole('checkbox').check(); await expect(this.row(title)).toHaveAttribute('data-completed','true'); }
 async edit(title: string, replacement: string) {
  const row=this.row(title);await row.getByRole('button', { name: `Edit ${title}`, exact: true }).click();
  await row.getByRole('textbox', { name: 'Edit task title', exact: true }).fill(replacement);
  await row.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(this.row(replacement)).toBeVisible();
 }
 async filter(name: 'All'|'Active'|'Completed') { await this.page.getByRole('button', { name, exact: true }).click(); }
}
