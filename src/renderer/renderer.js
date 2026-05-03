const $ = (id) => document.getElementById(id);

const updateDate = () => {
  $('dateLabel').textContent = new Date().toLocaleString();
};

const renderDashboard = async () => {
  const data = await window.sohamOS.db.getDashboardData();
  $('pendingTasks').textContent = data.pendingTasks;
  $('contentIdeas').textContent = data.contentIdeas;
  $('scriptsCount').textContent = data.scripts;
  $('productivityScore').textContent = `${data.productivityScore}%`;
};

const renderTasks = async () => {
  const tasks = await window.sohamOS.db.getTasks();
  $('taskList').innerHTML = tasks.map(t => `
    <li class="${t.completed ? 'done' : ''}">
      <b>${t.title}</b><br/>
      <small>${t.date || 'No date'} ${t.time_slot || ''}</small><br/>
      <button onclick="toggleTask(${t.id})">${t.completed ? 'Undo' : 'Complete'}</button>
    </li>
  `).join('');
};

const renderContent = async () => {
  const items = await window.sohamOS.db.getContent();
  $('contentList').innerHTML = items.map(i => `
    <li>
      <b>[${i.kind.toUpperCase()}] ${i.title}</b>
      <p>${(i.body || '').slice(0, 180)}</p>
    </li>
  `).join('');
};

const renderReminders = async () => {
  const reminders = await window.sohamOS.db.getReminders();
  $('reminderList').innerHTML = reminders.map(r => `
    <li>
      <b>${r.title}</b><br/>
      <small>${new Date(r.remind_at).toLocaleString()}</small>
    </li>
  `).join('');
};

window.toggleTask = async (id) => {
  await window.sohamOS.db.toggleTask(id);
  await refreshAll();
};

$('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  await window.sohamOS.db.saveTask({
    title: $('taskTitle').value,
    date: $('taskDate').value,
    timeSlot: $('taskTime').value
  });
  e.target.reset();
  await refreshAll();
});

$('contentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  await window.sohamOS.db.saveContent({
    kind: $('contentKind').value,
    title: $('contentTitle').value,
    body: $('contentBody').value
  });
  e.target.reset();
  await refreshAll();
});

$('reminderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = $('reminderTitle').value;
  const remindAt = $('reminderTime').value;
  await window.sohamOS.db.saveReminder({ title, remindAt });
  window.sohamOS.notifications.show('SohamOS Reminder Scheduled', `${title} at ${new Date(remindAt).toLocaleString()}`);
  e.target.reset();
  await refreshAll();
});

async function refreshAll() {
  updateDate();
  await Promise.all([renderDashboard(), renderTasks(), renderContent(), renderReminders()]);
}

refreshAll();
setInterval(updateDate, 1000);
