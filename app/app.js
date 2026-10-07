let workspace = new URLSearchParams(location.search).get('workspace') || localStorage.getItem('taskflow-workspace');
if (!workspace) workspace = crypto.randomUUID();
localStorage.setItem('taskflow-workspace',workspace);
const list = document.querySelector('#tasks'), error = document.querySelector('#error');
let tasks = [], filter = 'All';
function showError(message) { error.textContent = message; error.hidden = false; }
async function api(path='',method='GET',data) {
 const response = await fetch('/api/tasks'+path,{method,headers:{'Content-Type':'application/json','X-Workspace':workspace},body:data ? JSON.stringify(data) : undefined});
 const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Request failed'); return body;
}
function render() {
 list.replaceChildren(); const visible = tasks.filter(t=>filter==='All' || (filter==='Active' ? !t.completed : t.completed));
 document.querySelector('#count').textContent = `${tasks.filter(t=>!t.completed).length} active · ${tasks.length} total`;
 document.querySelector('#empty').hidden = visible.length > 0;
 document.querySelector('#empty').textContent = tasks.length ? 'No tasks match this filter.' : 'No tasks yet. Add your first task above.';
 document.querySelector('#clear-completed').disabled = !tasks.some(t=>t.completed);
 for (const task of visible) {
  const row = document.createElement('li');row.dataset.testid='task';row.dataset.id=task.id;row.dataset.completed=String(task.completed);
  const checkbox = document.createElement('input');checkbox.type='checkbox';checkbox.checked=task.completed;checkbox.setAttribute('aria-label',`Complete ${task.title}`);
  checkbox.addEventListener('change',async()=>{try{await api('/'+task.id,'PATCH',{completed:checkbox.checked});await load();}catch(e){checkbox.checked=task.completed;showError(e.message);}});
  const title=document.createElement('span');title.className='task-title';title.dataset.testid='task-title';title.textContent=task.title;
  const badge=document.createElement('span');badge.className='badge';badge.textContent=task.priority;
  const edit=document.createElement('button');edit.textContent='Edit';edit.setAttribute('aria-label',`Edit ${task.title}`);
  edit.addEventListener('click',()=>{
   const input=document.createElement('input');input.value=task.title;input.maxLength=100;input.setAttribute('aria-label','Edit task title');title.replaceWith(input);input.focus();edit.disabled=true;
   const save=document.createElement('button');save.textContent='Save';row.append(save);
   save.addEventListener('click',async()=>{try{await api('/'+task.id,'PATCH',{title:input.value});await load();}catch(e){showError(e.message);}});
  });
  const remove=document.createElement('button');remove.textContent='Delete';remove.setAttribute('aria-label',`Delete ${task.title}`);
  remove.addEventListener('click',async()=>{try{await api('/'+task.id,'DELETE');await load();}catch(e){showError(e.message);}});
  row.append(checkbox,title,badge,edit,remove);list.append(row);
 }
}
async function load(){tasks=(await api()).tasks;render();}
document.querySelector('#create-form').addEventListener('submit',async event=>{
 event.preventDefault();error.hidden=true;const title=document.querySelector('#task-title');
 if (!title.value.trim()) return showError('Enter a task title.');
 const button=event.submitter;button.disabled=true;
 try{await api('','POST',{title:title.value,priority:document.querySelector('#priority').value});title.value='';await load();}catch(e){showError(e.message);}finally{button.disabled=false;}
});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();}));
document.querySelector('#clear-completed').addEventListener('click',async()=>{try{for(const task of tasks.filter(t=>t.completed))await api('/'+task.id,'DELETE');await load();}catch(e){showError(e.message);}});
load().catch(e=>showError(e.message));
