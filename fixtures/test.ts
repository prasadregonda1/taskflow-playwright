import { test as base, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { TasksApi } from '../support/tasks-api';
import { TasksPage } from '../pages/tasks.page';
export const test = base.extend<{ workspace: string; api: TasksApi; tasks: TasksPage }>({
 workspace: async ({}, use) => { await use(randomUUID()); },
 api: async ({ playwright, baseURL, workspace }, use) => {
  const request=await playwright.request.newContext({ baseURL, extraHTTPHeaders:{ 'X-Workspace':workspace } });
  const api=new TasksApi(request,workspace);
  try { await use(api); } finally { await api.clear(); await request.dispose(); }
 },
 tasks: async ({ page, workspace, api }, use) => {
  await page.setExtraHTTPHeaders({ 'X-Workspace':workspace });
  // Depend on api so each UI workspace is cleaned after the test.
  await use(new TasksPage(page,api.workspace));
 }
});
export { expect };
