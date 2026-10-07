import { test, expect } from '../fixtures/test';
test('new workspace is empty @smoke', async ({ api }) => { expect(await api.list()).toEqual([]); });
test('create returns task schema and stores trimmed title', async ({ api }) => {
 const task=await api.create('  Review release  ','High');
 expect(task).toEqual({ id:expect.any(String), title:'Review release', priority:'High', completed:false });
 expect(await api.list()).toEqual([task]);
});
for (const title of ['', '   ', 'x'.repeat(101)]) {
 test(`reject invalid title length ${title.length}`, async ({ api }) => {
  const r=await api.request.post('/api/tasks',{data:{title}});expect(r.status()).toBe(422);
  expect((await r.json()).error).toContain('Title');expect(await api.list()).toEqual([]);
 });
}
test('accept boundary title of 100 characters', async ({ api }) => { expect((await api.create('a'.repeat(100))).title).toHaveLength(100); });
test('reject unknown priority', async ({ api }) => {
 const r=await api.request.post('/api/tasks',{data:{title:'Task',priority:'Urgent'}});expect(r.status()).toBe(422);expect(await api.list()).toEqual([]);
});
test('update title, priority and completion', async ({ api }) => {
 const t=await api.create('Old');expect(await api.update(t.id,{title:'New',priority:'Low',completed:true})).toEqual({...t,title:'New',priority:'Low',completed:true});
});
test('invalid update preserves existing task', async ({ api }) => {
 const t=await api.create('Keep me');const r=await api.request.patch(`/api/tasks/${t.id}`,{data:{completed:'yes'}});
 expect(r.status()).toBe(422);expect(await api.list()).toEqual([t]);
});
test('delete returns missing resource on next read', async ({ api }) => {
 const t=await api.create('Remove');expect((await api.request.delete(`/api/tasks/${t.id}`)).status()).toBe(200);
 expect((await api.request.get(`/api/tasks/${t.id}`)).status()).toBe(404);expect(await api.list()).toEqual([]);
});
test('unknown task returns 404', async ({ api }) => { expect((await api.request.patch('/api/tasks/missing',{data:{title:'New'}})).status()).toBe(404); });
test('malformed JSON returns 400', async ({ api }) => {
 const r=await api.request.post('/api/tasks',{headers:{'Content-Type':'application/json'},data:'{bad'});expect(r.status()).toBe(400);expect(await api.list()).toEqual([]);
});
test('request without workspace returns 400', async ({ request }) => { expect((await request.get('/api/tasks')).status()).toBe(400); });
test('workspaces cannot read another workspace tasks', async ({ api, playwright, baseURL }) => {
 await api.create('Private task');const other=await playwright.request.newContext({baseURL,extraHTTPHeaders:{'X-Workspace':'isolation-'+api.workspace}});
 try {expect((await (await other.get('/api/tasks')).json()).tasks).toEqual([]);}finally{await other.delete('/api/tasks');await other.dispose();}
});
