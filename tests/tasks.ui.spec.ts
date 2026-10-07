import { test, expect } from '../fixtures/test';
test('empty workspace and disabled cleanup @smoke', async ({ tasks, page }) => {
 await tasks.open();await expect(page.getByRole('heading',{name:'TaskFlow'})).toBeVisible();
 await expect(tasks.rows()).toHaveCount(0);await expect(page.getByRole('button',{name:'Clear completed'})).toBeDisabled();
});
for (const priority of ['Low','Medium','High'] as const) {
 test(`create ${priority} priority task @smoke`,async ({ tasks, api })=>{
  await tasks.open();await tasks.add('Review release',priority);await expect(tasks.row('Review release')).toContainText(priority);
  expect(await api.list()).toEqual([expect.objectContaining({title:'Review release',priority,completed:false})]);
 });
}
test('blank title displays validation without adding a task',async ({ tasks,page,api })=>{
 await tasks.open();await tasks.add('   ');await expect(page.getByRole('alert')).toHaveText('Enter a task title.');expect(await api.list()).toEqual([]);
});
test('completion updates counter and API',async ({ tasks,page,api })=>{
 await api.create('Write tests');await tasks.open();await tasks.complete('Write tests');
 await expect(page.getByRole('status')).toHaveText('0 active · 1 total');expect((await api.list())[0].completed).toBe(true);
});
test('active and completed filters separate tasks',async ({ tasks,api })=>{
 await api.create('Active task');const done=await api.create('Done task');await api.update(done.id,{completed:true});await tasks.open();
 await tasks.filter('Active');await expect(tasks.rows()).toHaveCount(1);await expect(tasks.row('Active task')).toBeVisible();
 await tasks.filter('Completed');await expect(tasks.rows()).toHaveCount(1);await expect(tasks.row('Done task')).toBeVisible();
 await tasks.filter('All');await expect(tasks.rows()).toHaveCount(2);
});
test('edit persists after browser reload',async ({ tasks,page,api })=>{
 await api.create('Draft');await tasks.open();await tasks.edit('Draft','Final plan');await page.reload();await expect(tasks.row('Final plan')).toBeVisible();
 expect((await api.list())[0].title).toBe('Final plan');
});
test('delete removes correct item',async ({ tasks,api })=>{
 await api.create('Keep');await api.create('Delete me');await tasks.open();
 await tasks.row('Delete me').getByRole('button',{name:'Delete Delete me',exact:true}).click();await expect(tasks.rows()).toHaveCount(1);
 expect((await api.list()).map(t=>t.title)).toEqual(['Keep']);
});
test('clear completed retains active tasks',async ({ tasks,page,api })=>{
 await api.create('Active');const t=await api.create('Done');await api.update(t.id,{completed:true});await tasks.open();
 await page.getByRole('button',{name:'Clear completed'}).click();await expect(tasks.rows()).toHaveCount(1);expect((await api.list())[0].title).toBe('Active');
});
test('network failure preserves draft and permits retry',async ({ tasks,page,api })=>{
 await tasks.open();await page.route('**/api/tasks',async route=>{
  if(route.request().method()==='POST')await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Service unavailable'})});else await route.continue();
 });
 await tasks.add('Retry task');await expect(page.getByRole('alert')).toHaveText('Service unavailable');
 await expect(page.getByLabel('Task title',{exact:true})).toHaveValue('Retry task');expect(await api.list()).toEqual([]);
 await page.unroute('**/api/tasks');await page.getByRole('button',{name:'Add task',exact:true}).click();await expect(tasks.row('Retry task')).toBeVisible();
});
test('HTML-like task title is displayed as text',async ({ tasks,page })=>{
 const title='<img src=x onerror=alert(1)>';await tasks.open();await tasks.add(title);
 await expect(tasks.row(title).getByTestId('task-title')).toHaveText(title);await expect(page.locator('#tasks img')).toHaveCount(0);
});
test('keyboard Enter submits a task',async ({ tasks,page })=>{
 await tasks.open();await page.getByLabel('Task title',{exact:true}).fill('Keyboard task');await page.getByLabel('Task title',{exact:true}).press('Enter');await expect(tasks.row('Keyboard task')).toBeVisible();
});
