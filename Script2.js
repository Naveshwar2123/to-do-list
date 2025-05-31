// DOM Elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');
const taskCount = document.getElementById('task-count');

// State
let tasks = [];
let currentFilter = 'all';

// Initialize the app
function init() {
    loadTasks();
    renderTasks();
    setupEventListeners();
    updateTaskCount();
}

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTaskCount();
}

// Render tasks based on current filter
function renderTasks() {
    taskList.innerHTML = '';
    
    const filteredTasks = filterTasks();
    
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = 'No tasks found';
        emptyMessage.classList.add('empty-message');
        taskList.appendChild(emptyMessage);
        return;
    }
    
    filteredTasks.forEach((task, index) => {
        const taskItem = createTaskElement(task, index);
        taskList.appendChild(taskItem);
    });
}

// Create a task element
function createTaskElement(task, index) {
    const taskItem = document.createElement('li');
    taskItem.classList.add('task-item');
    
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    
    taskItem.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
        <div class="task-actions">
            <button class="edit-btn"><i class="fas fa-edit"></i></button>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    // Add event listeners to the new elements
    const checkbox = taskItem.querySelector('.task-checkbox');
    const editBtn = taskItem.querySelector('.edit-btn');
    const deleteBtn = taskItem.querySelector('.delete-btn');
    
    checkbox.addEventListener('change', () => toggleTaskComplete(index));
    editBtn.addEventListener('click', () => enableEditMode(taskItem, index));
    deleteBtn.addEventListener('click', () => deleteTask(index));
    
    return taskItem;
}

// Filter tasks based on current filter
function filterTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// Add a new task
function addTask() {
    const text = taskInput.value.trim();
    
    if (!text) {
        alert('Please enter a task');
        return;
    }
    
    const newTask = {
        text,
        completed: false,
        id: Date.now(),
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
}

// Toggle task completion status
function toggleTaskComplete(index) {
    const filteredTasks = filterTasks();
    const actualIndex = tasks.findIndex(task => task.id === filteredTasks[index].id);
    
    if (actualIndex !== -1) {
        tasks[actualIndex].completed = !tasks[actualIndex].completed;
        saveTasks();
        renderTasks();
    }
}

// Enable edit mode for a task
function enableEditMode(taskItem, index) {
    const filteredTasks = filterTasks();
    const actualIndex = tasks.findIndex(task => task.id === filteredTasks[index].id);
    
    if (actualIndex === -1) return;
    
    taskItem.classList.add('editing');
    const taskText = taskItem.querySelector('.task-text');
    const currentText = taskText.textContent;
    
    taskItem.innerHTML = `
        <input type="text" class="edit-input" value="${currentText}">
        <button class="save-btn">Save</button>
    `;
    
    const editInput = taskItem.querySelector('.edit-input');
    const saveBtn = taskItem.querySelector('.save-btn');
    
    editInput.focus();
    
    saveBtn.addEventListener('click', () => saveEditedTask(actualIndex, editInput.value.trim()));
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEditedTask(actualIndex, editInput.value.trim());
        }
    });
}

// Save edited task
function saveEditedTask(index, newText) {
    if (!newText) {
        alert('Task cannot be empty');
        return;
    }
    
    tasks[index].text = newText;
    saveTasks();
    renderTasks();
}

// Delete a task
function deleteTask(index) {
    const filteredTasks = filterTasks();
    const actualIndex = tasks.findIndex(task => task.id === filteredTasks[index].id);
    
    if (actualIndex !== -1) {
        tasks.splice(actualIndex, 1);
        saveTasks();
        renderTasks();
    }
}

// Clear completed tasks
function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// Update filter
function updateFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTasks();
}

// Update task count
function updateTaskCount() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} left`;
}

// Set up event listeners
function setupEventListeners() {
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => updateFilter(btn.dataset.filter));
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);