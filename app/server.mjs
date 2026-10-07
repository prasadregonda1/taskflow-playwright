import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
const spaces = new Map();
const staticFiles = { '/': ['index.html','text/html'], '/app.js': ['app.js','text/javascript'], '/styles.css': ['styles.css','text/css'] };
function send(res, code, body) { res.writeHead(code, { 'Content-Type':'application/json', 'Cache-Control':'no-store' }); res.end(JSON.stringify(body)); }
async function bodyOf(req) {
 let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 10000) throw new Error('Payload too large'); }
 const data = JSON.parse(raw || '{}');
 if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Object body required');
 return data;
}
function validate(data, partial = false) {
 if (!partial || 'title' in data) {
  if (typeof data.title !== 'string' || !data.title.trim() || data.title.trim().length > 100) return 'Title must contain 1–100 characters';
 }
 if ('priority' in data && !['Low','Medium','High'].includes(data.priority)) return 'Invalid priority';
 if ('completed' in data && typeof data.completed !== 'boolean') return 'Completed must be boolean';
 if (Object.keys(data).some(k => !['title','priority','completed'].includes(k))) return 'Unknown field';
 return null;
}
const server = http.createServer(async (req, res) => {
 const url = new URL(req.url, 'http://127.0.0.1');
 try {
  if (url.pathname === '/health') return send(res,200,{ status:'ok' });
  if (req.method === 'GET' && staticFiles[url.pathname]) {
   const [file,type] = staticFiles[url.pathname];
   res.writeHead(200, { 'Content-Type':type, 'Cache-Control':'no-store' });
   return res.end(await readFile(new URL(file,import.meta.url)));
  }
  if (!url.pathname.startsWith('/api/tasks')) return send(res,404,{ error:'Not found' });
  const space = req.headers['x-workspace'];
  if (typeof space !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(space)) return send(res,400,{ error:'Valid X-Workspace header required' });
  if (!spaces.has(space)) spaces.set(space,new Map());
  const tasks = spaces.get(space);
  const match = url.pathname.match(/^\/api\/tasks(?:\/([a-zA-Z0-9-]+))?$/);
  if (!match) return send(res,404,{ error:'Not found' });
  const id = match[1];
  if (!id && req.method === 'GET') return send(res,200,{ tasks:[...tasks.values()] });
  if (!id && req.method === 'DELETE') { tasks.clear(); spaces.delete(space); return send(res,200,{ deleted:true }); }
  if (!id && req.method === 'POST') {
   const data = await bodyOf(req); const error = validate(data); if (error) return send(res,422,{ error });
   const task = { id:randomUUID(), title:data.title.trim(), priority:data.priority || 'Medium', completed:data.completed ?? false };
   tasks.set(task.id,task); return send(res,201,task);
  }
  if (id && !tasks.has(id)) return send(res,404,{ error:'Task not found' });
  if (id && req.method === 'GET') return send(res,200,tasks.get(id));
  if (id && req.method === 'PATCH') {
   const data = await bodyOf(req); const error = validate(data,true); if (error) return send(res,422,{ error });
   const task = { ...tasks.get(id), ...data }; if ('title' in data) task.title = data.title.trim();
   tasks.set(id,task); return send(res,200,task);
  }
  if (id && req.method === 'DELETE') { tasks.delete(id); return send(res,200,{ deleted:true }); }
  return send(res,405,{ error:'Method not allowed' });
 } catch (error) { return send(res,400,{ error:error.message }); }
});
server.listen(4173,'127.0.0.1',()=>console.log('TaskFlow running at http://127.0.0.1:4173'));
