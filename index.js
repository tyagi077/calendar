$(document).ready(function () {
    const weeks = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const years = ["2020", "2021", "2022", "2023", "2024", "2025"];

    months.forEach((month, index) => {
        $('#monthdropdown').append(`<option value="${index + 1}">${month}</option>`);
    });

    years.forEach(year => {
        $('#yeardropdown').append(`<option value="${year}">${year}</option>`);
    });

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    $('#monthdropdown').val(currentMonth);
    $('#yeardropdown').val(currentYear);

    const getStoredTasks = () => JSON.parse(localStorage.getItem("tasks")) || {};
    const storeTasks = (tasks) => localStorage.setItem("tasks", JSON.stringify(tasks));

    function renderWeekDays() {
        $('.calendar').empty();
        weeks.forEach(week => {
            $('.calendar').append(`<div class="month-div">${week}</div>`);
        });
    }

    function renderCalendar(month, year) {
        const totalDays = new Date(year, month, 0).getDate();
        const startDay = new Date(year, month - 1, 1).getDay();
        const tasks = getStoredTasks();

        renderWeekDays();

        for (let i = 0; i < startDay; i++) {
            $('.calendar').append(`<div class="day-div empty"></div>`);
        }

        for (let i = 1; i <= totalDays; i++) {
            const dateKey = `${year}-${month}-${i}`;
            const dayTasks = tasks[dateKey] || [];

            let taskHtml = dayTasks.map(task => `
                <div class="task-box ${task.completed ? 'completed' : ''}" data-title="${task.title}" data-desc="${task.desc}" data-day="${i}">
                    <div class="task-content">${task.title.length > 30 ? task.title.slice(0, 15) + '...' : task.title}</div>
                </div>
            `).join('');

            $('.calendar').append(`
                <div class="day-div" data-day="${i}">
                    ${i}<div class="tasks">${taskHtml}</div>
                </div>
            `);
        }
    }

    renderWeekDays();
    renderCalendar(currentMonth, currentYear);

    $('#monthdropdown, #yeardropdown').on('change', () => {
        const selectedMonth = parseInt($('#monthdropdown').val());
        const selectedYear = parseInt($('#yeardropdown').val());
        if (selectedMonth && selectedYear) {
            renderCalendar(selectedMonth, selectedYear);
        }
    });

    let selectedDay;
    let currentTaskBox = null;

    $(document).on('click', '.day-div', function () {
        if (!$(this).hasClass('empty')) {
            selectedDay = $(this).data('day');
            $('.model').css('display', 'flex');
        }
    });

    $("#addTaskBtn").on('click', () => {
        const title = $("#taskTitle").val().trim();
        const desc = $("#taskDesc").val().trim();
        if (!title || !desc || !selectedDay) return;

        const month = $('#monthdropdown').val();
        const year = $('#yeardropdown').val();
        const dateKey = `${year}-${month}-${selectedDay}`;
        const tasks = getStoredTasks();

        const newTask = { title, desc, completed: false };
        if (!tasks[dateKey]) tasks[dateKey] = [];
        tasks[dateKey].push(newTask);
        storeTasks(tasks);

        renderCalendar(month, year);
        $("#taskForm")[0].reset();
        $(".model").css('display', 'none');
    });

    $("#cancelTaskBtn").on('click', () => {
        $("#taskForm")[0].reset();
        $(".model").css('display', 'none');
    });

    $(document).on('click', '.task-box', function (e) {
        e.stopPropagation();
        currentTaskBox = $(this);

        const title = currentTaskBox.data('title');
        const desc = currentTaskBox.data('desc');
        selectedDay = currentTaskBox.data('day');

        $('#viewTitle').text(title);
        $('#viewDesc').text(desc);
        $('#markComplete').prop('checked', currentTaskBox.hasClass('completed'));

        $('.task-view-modal').fadeIn();
    });

    $('#markComplete').on('change', function () {
        if (currentTaskBox) {
            const month = $('#monthdropdown').val();
            const year = $('#yeardropdown').val();
            const dateKey = `${year}-${month}-${selectedDay}`;
            const tasks = getStoredTasks();

            const index = tasks[dateKey].findIndex(task =>
                task.title === currentTaskBox.data('title') &&
                task.desc === currentTaskBox.data('desc')
            );
            if (index > -1) {
                tasks[dateKey][index].completed = this.checked;
                storeTasks(tasks);
                renderCalendar(month, year);
                $('.task-view-modal').fadeOut();
            }
        }
    });

    $('#editTaskBtn').on('click', function () {
        if (currentTaskBox) {
            const oldTitle = currentTaskBox.data('title');
            const oldDesc = currentTaskBox.data('desc');
            const newTitle = prompt("Edit Title", oldTitle);
            const newDesc = prompt("Edit Description", oldDesc);
            if (newTitle !== null && newDesc !== null) {
                const month = $('#monthdropdown').val();
                const year = $('#yeardropdown').val();
                const dateKey = `${year}-${month}-${selectedDay}`;
                const tasks = getStoredTasks();

                const index = tasks[dateKey].findIndex(task => task.title === oldTitle && task.desc === oldDesc);
                if (index > -1) {
                    tasks[dateKey][index].title = newTitle;
                    tasks[dateKey][index].desc = newDesc;
                    storeTasks(tasks);
                    renderCalendar(month, year);
                    $('.task-view-modal').fadeOut();
                }
            }
        }
    });

    $('#deleteTaskBtn').on('click', function () {
        if (currentTaskBox && confirm("Delete this task?")) {
            const title = currentTaskBox.data('title');
            const desc = currentTaskBox.data('desc');

            const month = $('#monthdropdown').val();
            const year = $('#yeardropdown').val();
            const dateKey = `${year}-${month}-${selectedDay}`;
            const tasks = getStoredTasks();

            tasks[dateKey] = tasks[dateKey].filter(task => !(task.title === title && task.desc === desc));
            storeTasks(tasks);
            renderCalendar(month, year);
            $('.task-view-modal').fadeOut();
        }
    });

    $('#closeTaskView').on('click', function () {
        $('.task-view-modal').fadeOut();
    });
});
