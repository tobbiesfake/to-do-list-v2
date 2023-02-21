//-------------DECLARATIONS-------------//
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

let currentPanel;
let prevTask;
let myTaskData = {};

let allTasks = $$('.task-item');
let checkIcons = $$('.task-item span i');
let unmarkIcons = $$('.task-item span i.uil-circle');
const allPanels = $$('.panel-item ul li');
const taskContainer = $('.task');
const allTags = $$('.task-container ul[tag-data]');
const completedTag = $('.task-container ul#completed');

const adderContainer = $('.task-adder');
const adder = $('.task-adder input');
const adderIcon = $('.task-adder i');

const infoPanel = $('div .info');
const taskInfo = $('.info-field');
const deleteBtn = $('.info-bot .delete');

//-------------FUNCTIONS---------------//
const reQueryItems = function () {
    checkIcons = $$('.task-item span i');
    allTasks = $$('.task-item');
    unmarkIcons = $$('.task-item span i.uil-circle');
}

const inputActive = function (e) {
    if (e.target.value !== '') {
        adderIcon.style.color = '#fff';
        adderIcon.className = 'uil uil-arrow-circle-up';
        return
    }
    adderIcon.style.color = 'var(--overlay-bg)';
    adderIcon.className = 'uil uil-plus-circle';
}

const addTask = function (task, panel, state, order) {
    let location;
    const add = function (status) {
        switch (status) {
            case 'completed':
                location.innerHTML =
                    `<li order="${order}" tag='${panel}' class="task-item complete-task">
                        <span><i class="uil uil-check-circle"></i></span>${task}
                    </li>` +
                    location.innerHTML;
                break;
            case 'uncompleted':
                location.innerHTML =
                    `<li order="${order}" tag='${panel}' class="task-item">
                        <span><i class="uil uil-circle"></i></span>${task}
                    </li>` +
                    location.innerHTML;
                break;
        }
    }
    switch (currentPanel) {
        case 'completed':
        case 'uncompleted':
            location = $(`#${panel}`);
            add(currentPanel);
            break;
        default:
            if (state === 'uncompleted') {
                location = $(`#${panel}`);
            } else {
                location = $(`#${state}`);
            }
            add(state);
            break;
    }

}

const hintSelectTask = (e) => {
    let task = e.target;
    let selectedTask = $('.task-item.task-selected');
    if (selectedTask !== task && selectedTask !== null) {
        selectedTask.classList.remove('task-selected');
    }
    task.classList.toggle('task-selected');
    return task.classList.contains('task-selected');
}

const hideShowAdder = function () {
    if (currentPanel === 'completed' || currentPanel === 'uncompleted') {
        adderContainer.classList.add('hide');
        $('.task-container').classList.add('expand-task-container');
    } else {
        adderContainer.classList.remove('hide');
        $('.task-container').classList.remove('expand-task-container');
    }
}

const showTasks = function (panel) {
    const loopState = function (arr, cate, status) {
        if (arr[0] !== undefined) {
            for (let i = arr.length - 1; i >= 0; i--) {
                addTask(arr[i], cate, status, i);
            }
        }
    }
    allTasks.forEach((els) => {
        els.remove();
    });
    switch (panel) {
        case 'completed':
        case 'uncompleted':
            for (let cate in myTaskData) {
                let container = myTaskData[cate][panel];
                loopState(container, cate, panel);
            }
            break;
        default:
            let container = myTaskData[panel];
            for (let state in container) {
                loopState(container[state], panel, state);
            }
            break;
    }
    interactToTask();
}

const showTags = function (tag) {
    allTags.forEach(function (els) {
        els.style.display = 'none';
        switch (tag) {
            case 'completed':
                if (myTaskData[els.id]['completed'][0]) {
                    els.style.display = 'block';
                }
                break;
            case 'uncompleted':
                if (myTaskData[els.id]['uncompleted'][0]) {
                    els.style.display = 'block';
                }
                break;
            default:
                if (els.id === tag && myTaskData[tag]['uncompleted'][0]) {
                    els.style.display = 'block';
                }
                break;
        }
    })
}

const showCompleteTag = function () {
    completedTag.classList.add('hide');
    if (currentPanel !== 'completed' && currentPanel !== 'uncompleted') {
        if (myTaskData[currentPanel].completed[0]) {
            completedTag.classList.remove('hide');
        }
    }
}

const toggleCompletion = function (e) {
    e.stopPropagation();
    updateData(currentPanel, e, 'mark');
    showTasks(currentPanel);
    showTags(currentPanel);
    showCompleteTag();
    taskInfo.value = null;
    infoEventLis('remove');
}

const infoEventLis = function (action) {
    switch (action) {
        case 'add':
            taskInfo.addEventListener('focusout', changeTaskContent);
            deleteBtn.addEventListener('click', deleteTask);
            break;

        case 'remove':
            taskInfo.removeEventListener('focusout', changeTaskContent);
            deleteBtn.removeEventListener('click', deleteTask);
            break;
    }
}

const changeTaskContent = function () {
    updateData(prevTask, null, 'update');
}

const deleteTask = function () {
    taskInfo.value = null;
    infoEventLis('remove');
    updateData(prevTask.target.offsetParent.id, prevTask.target.attributes.order.value, 'delete');
    showTasks(currentPanel);
    showCompleteTag();
    showTags(currentPanel);
}

const onlyChangeThisTask = function (e) {
    e.stopPropagation();
    taskInfo.value = null;
    taskInfo.blur();
    if (prevTask) {
        infoEventLis('remove');
    }

    if (hintSelectTask(e)) {
        taskInfo.value = e.target.innerText;
        taskInfo.focus();
        prevTask = e;
        infoEventLis('add');
    }
}

const interactToTask = function () {
    reQueryItems();
    checkIcons.forEach((element) => {
        element.addEventListener('click', toggleCompletion);
    });
    unmarkIcons.forEach((ele) => ele.addEventListener('click', () => {
        new Audio('assets/sound/ting.mp3').play();
    }))
    allTasks.forEach((element) => {
        element.addEventListener('click', onlyChangeThisTask);
    });
}

const updateData = async function (cate, value, action) {
    const result = function (act) {
        if(action === 'add'){
            return myTaskData[cate].uncompleted.unshift(value);
        }
        if(action === 'delete'){
            if (currentPanel === 'completed' || currentPanel === 'uncompleted') {
                return myTaskData[cate][currentPanel].splice(value, 1);
            }
            if (cate === 'completed') {
                return myTaskData[currentPanel].completed.splice(value, 1);
            }
            return myTaskData[currentPanel].uncompleted.splice(value, 1);
        }
        if(action === 'mark'){
            let task;
            let tag = value.srcElement.offsetParent.attributes.tag.value;
            let key = value.srcElement.offsetParent.attributes.order.value;
            switch (cate) {
                case 'completed':
                    [task] = myTaskData[tag][cate].splice(key, 1);
                    myTaskData[tag].uncompleted.unshift(task);
                    break;
                case 'uncompleted':
                    [task] = myTaskData[tag][cate].splice(key, 1);
                    myTaskData[tag].completed.unshift(task);
                    break;
                default:
                    if (value.srcElement.offsetParent.offsetParent.id === 'completed') {
                        [task] = myTaskData[cate].completed.splice(key, 1);
                        myTaskData[cate].uncompleted.unshift(task);
                    } else {
                        [task] = myTaskData[cate].uncompleted.splice(key, 1);
                        myTaskData[cate].completed.unshift(task);
                    }
                    break;
            }
            return;
        }
        if(action === 'update'){
            let order = cate.target.attributes.order.value;
            let tagName = cate.target.attributes.tag.value;
            if (taskInfo.value !== '' && taskInfo.value !== cate.target.innerText) {
                cate.srcElement.lastChild.data = taskInfo.value;
                if (currentPanel === 'completed' || currentPanel === 'uncompleted') {
                    myTaskData[tagName][currentPanel][order] = taskInfo.value;
                } else {
                    if (cate.target.offsetParent.id === 'completed') {
                        myTaskData[currentPanel].completed[order] = taskInfo.value;
                    } else {
                        myTaskData[currentPanel].uncompleted[order] = taskInfo.value;
                    }
                }
            } else {
                taskInfo.value = cate.target.innerText;
            }
            return;
        }
    }
    await result(action);
    storeToLocal();
}

const storeToLocal = function () {
    let storeValue = JSON.stringify(myTaskData);
    window.localStorage.setItem('myLocalTasks', storeValue);
}

// ----------------EXECUTING-----------------------//
//Initialize Data//
if (window.localStorage.getItem('myLocalTasks')) {
    myTaskData = JSON.parse(window.localStorage.getItem('myLocalTasks'));
} else if(!window.localStorage.getItem('myLocalTasks')){
    window.localStorage.setItem('myLocalTasks', `{"myDay":{"completed":[],"uncompleted":["Type task to |Add to task| fied and press Enter","|Completed| shows all your completed tasks","|All| shows all your uncomplete tasks","Tap the circles to complete your tasks ✔️","🖱️ Click this task to view and edit information in content field ✏️","👉 Select this task and click 🗑️ in the right bottom corner to delete it"]},"important":{"completed":["This is an important panel's completed task"],"uncompleted":["This is an important panel's uncomplete task"]},"assignToMe":{"completed":["Assign to me panel's completed task"],"uncompleted":["Assign to me panel's uncomplete task"]},"planned":{"completed":["Planned completed task"],"uncompleted":["Planned uncompleted task"]},"groceries":{"completed":[],"uncompleted":["Milk 🍼","Bread 🍞","Eggs 🥚","Fruit & Vegetables 🥕"]},"work":{"completed":[],"uncompleted":["Task at work ..."]},"school":{"completed":[],"uncompleted":["Task at school"]},"family":{"completed":[],"uncompleted":["For family ❤️‍🔥"]}}`);
}
currentPanel = 'myDay';

$(`.panel-item ul li[keyaccess=${currentPanel}`).classList.add('active-panel');
hideShowAdder();
showTags(currentPanel);
showTasks(currentPanel);
showCompleteTag();

//Todo List's Interaction//
adder.addEventListener('input', inputActive);
adder.addEventListener('keydown', (e) => {
    if (e.which === 13 && e.target.value !== '') {
        updateData(currentPanel, adder.value, 'add');
        showTags(currentPanel);
        showTasks(currentPanel);
        adder.value = null;
        inputActive(e);
    }
})

taskInfo.addEventListener('keydown', function (event) {
    if (event.which === 13 && taskInfo.value !== '') {
        taskInfo.blur();
    } else if (event.which === 13 && taskInfo.value === '') {
        event.preventDefault();
    }
})

allPanels.forEach((elt) => {
    elt.addEventListener('click', function () {
        $('.categories-item.active-panel').classList.remove('active-panel');
        this.classList.add('active-panel');
        currentPanel = this.attributes.keyaccess.value;
        hideShowAdder();
        infoEventLis('remove');
        taskInfo.value = null;
        showTags(currentPanel);
        showTasks(currentPanel);
        showCompleteTag();
    })
})
