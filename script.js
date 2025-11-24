document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const reminderInput = document.getElementById('reminder-datetime');
    const priorityInput = document.getElementById('task-priority');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const tasksCompletedTodayEl = document.getElementById('tasks-completed-today');
    const tasksActiveTotalEl = document.getElementById('tasks-active-total');
    const getTasks = () => {
        const tasksJSON = localStorage.getItem('tasks');
        return tasksJSON ? JSON.parse(tasksJSON) : [];
    };

    const saveTasks = (tasks) => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };
    const priorityValue = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const sortTasks = (tasks) => {
        return tasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            if (!a.completed) {
                const priorityDiff = priorityValue[b.priority] - priorityValue[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                const timeA = a.reminderTime ? new Date(a.reminderTime).getTime() : Infinity;
                const timeB = b.reminderTime ? new Date(b.reminderTime).getTime() : Infinity;
                return timeA - timeB;
            }
            return 0; 
        });
    };
    const formatReminderTime = (datetimeString) => {
        if (!datetimeString) return 'No Due Date';
        const date = new Date(datetimeString);
        return date.toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };
    const updateStats = (tasks) => {
        const today = new Date().toDateString();
        const completedToday = tasks.filter(task => 
            task.completed && task.completionDate && new Date(task.completionDate).toDateString() === today
        ).length;
        const activeTotal = tasks.filter(task => !task.completed).length;

        tasksCompletedTodayEl.textContent = completedToday;
        tasksActiveTotalEl.textContent = activeTotal;
    };
    const renderTasks = (filter = 'all') => {
        const tasks = sortTasks(getTasks());
        taskList.innerHTML = '';
        updateStats(tasks);
        const filteredTasks = tasks.filter(task => {
            if (filter === 'all') return true;
            if (filter === 'active') return !task.completed;
            if (filter === 'completed') return task.completed;
            return true;
        });

        filteredTasks.forEach(createTaskElement);
    };
    const createTaskElement = (task) => {
        const listItem = document.createElement('li');
        listItem.classList.add('task-item', `priority-${task.priority}`);
        listItem.setAttribute('data-id', task.id);
        
        if (task.completed) {
            listItem.classList.add('completed');
        }

        const taskMainRow = document.createElement('div');
        taskMainRow.classList.add('task-main-row');

        const taskContent = document.createElement('span');
        taskContent.classList.add('task-content');
        taskContent.textContent = `[${task.priority}] ${task.content}`;
        taskContent.addEventListener('click', () => {
            toggleTaskCompletion(task.id);
        });

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('task-actions');

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'X'; 
        deleteBtn.addEventListener('click', () => {
            deleteTask(task.id, listItem);
        });

        taskMainRow.appendChild(taskContent);
        actionsDiv.appendChild(deleteBtn);
        taskMainRow.appendChild(actionsDiv);
        listItem.appendChild(taskMainRow);
        if (task.reminderTime) {
            const reminderTimeEl = document.createElement('p');
            reminderTimeEl.classList.add('task-reminder-time');
            reminderTimeEl.textContent = `Due: ${formatReminderTime(task.reminderTime)}`;
            
            const now = Date.now();
            const reminderDate = new Date(task.reminderTime).getTime();
            const timeDiff = reminderDate - now;
            
            if (!task.completed) {
                if (timeDiff <= 0) {
                    listItem.classList.add('overdue');
                    reminderTimeEl.classList.add('overdue-text');
                    reminderTimeEl.textContent = `Due: ${formatReminderTime(task.reminderTime)} (OVERDUE)`;
                } else if (timeDiff < 3600000) { 
                    listItem.classList.add('urgent'); 
                }
            }
            
            listItem.appendChild(reminderTimeEl);
        }

        taskList.appendChild(listItem);
    };
    const addTask = () => {
        const content = taskInput.value.trim();
        const reminderTime = reminderInput.value;
        const priority = priorityInput.value;

        if (content === '') {
            console.error('Please enter a task description!'); 
            return;
        }

        const newTask = {
            id: Date.now(),
            content: content,
            completed: false,
            priority: priority,
            reminderTime: reminderTime || null,
            completionDate: null
        };

        const tasks = getTasks();
        tasks.push(newTask);
        saveTasks(tasks);

        taskInput.value = ''; 
        reminderInput.value = '';
        priorityInput.value = 'Medium';
        
        const currentFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        renderTasks(currentFilter);
    };
    const toggleTaskCompletion = (id) => {
        const tasks = getTasks().map(task => {
            if (task.id === id) {
                if (!task.completed) {
                    console.log(`Task ${task.content} completed! 🎉`);
                    task.completionDate = new Date().toISOString();
                } else {
                    task.completionDate = null;
                }
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks(tasks);
        
        const currentFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        renderTasks(currentFilter);
    };
    const deleteTask = (id, listItem) => {
        listItem.classList.add('slide-out-left');
        listItem.addEventListener('animationend', () => {
            const tasks = getTasks().filter(task => task.id !== id);
            saveTasks(tasks);
            const currentFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            renderTasks(currentFilter);
        });
    };
    addTaskBtn.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    filterBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter');
            
            filterBtns.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            renderTasks(filter);
        });
    });
    renderTasks('all');
    setInterval(() => {
        const currentFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        renderTasks(currentFilter);
    }, 30000); 
});