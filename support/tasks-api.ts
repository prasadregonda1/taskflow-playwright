import { APIRequestContext, expect } from '@playwright/test';
export type Priority = 'Low' | 'Medium' | 'High';
export type Task = { id: string; title: string; priority: Priority; completed: boolean };
export class TasksApi {
 constructor(readonly request: APIRequestContext, readonly workspace: string) {}
 async list(): Promise<Task[]> { const r = await this.request.get('/api/tasks'); expect(r.status()).toBe(200); return (await r.json()).tasks; }
 async create(title: string, priority: Priority = 'Medium'): Promise<Task> {
  const r = await this.request.post('/api/tasks', { data: { title, priority } }); expect(r.status()).toBe(201); return r.json();
 }
 async update(id: string, fields: Partial<Pick<Task, 'title'|'priority'|'completed'>>): Promise<Task> {
  const r = await this.request.patch(`/api/tasks/${id}`, { data: fields }); expect(r.status()).toBe(200); return r.json();
 }
 async clear() { const r = await this.request.delete('/api/tasks'); expect(r.status()).toBe(200); }
}
