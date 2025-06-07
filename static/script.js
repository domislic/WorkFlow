const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

const shiftForm = document.getElementById('shiftForm');
const shiftList = document.getElementById('shiftList');
const monthSelect = document.getElementById('monthSelect');
const calendarContainer = document.getElementById('calendarContainer');
const totalHoursElem = document.getElementById('totalHours');
const totalPayElem = document.getElementById('totalPay');
const summaryChartCtx = document.getElementById('summaryChart').getContext('2d');

let createdShifts = [];
let calendarShifts = {};

let summaryChart; // Chart.js instance

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    tabContents.forEach(tc => {
      tc.style.display = tc.id === tab.dataset.tab ? 'block' : 'none';
    });

    if (tab.dataset.tab === 'calendar') {
      renderCalendar();
    }
    if (tab.dataset.tab === 'summary') {
      updateSummary();
    }
  });
});

// Add shift to list
shiftForm.addEventListener('submit', e => {
  e.preventDefault();

  const shiftType = document.getElementById('shiftType').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const hourlyRate = parseFloat(document.getElementById('hourlyRate').value) || 0;
  const bonus = parseFloat(document.getElementById('bonus').value) || 0;

  if (!shiftType || !startTime || !endTime || hourlyRate <= 0) {
    return alert('Molimo popunite sva polja ispravno.');
  }

  const duration = calculateDuration(startTime, endTime);

  createdShifts.push({ shiftType, startTime, endTime, hourlyRate, bonus, duration });

  renderShiftList();
  shiftForm.reset();
});

// Render created shifts list
function renderShiftList() {
  shiftList.innerHTML = '';
  createdShifts.forEach((s, i) => {
    const li = document.createElement('li');
    li.textContent = `${s.shiftType} | ${s.startTime} - ${s.endTime} | Satnica: €${s.hourlyRate.toFixed(2)} | Bonus: €${s.bonus.toFixed(2)} | Trajanje: ${s.duration} h`;

    const btnDel = document.createElement('button');
    btnDel.textContent = 'Izbriši';
    btnDel.style.marginLeft = '10px';
    btnDel.addEventListener('click', () => {
      createdShifts.splice(i, 1);
      renderShiftList();
    });

    li.appendChild(btnDel);
    shiftList.appendChild(li);
  });
}

// Calculate duration in hours
function calculateDuration(startTime, endTime) {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  let start = startH + startM / 60;
  let end = endH + endM / 60;
  if (end < start) {
    end += 24;
  }
  return +(end - start).toFixed(2);
}

// Month select change event
monthSelect.addEventListener('change', () => {
  renderCalendar();
});

// Render calendar
function renderCalendar() {
  const monthValue = monthSelect.value;
  if (!monthValue) {
    calendarContainer.innerHTML = '<p>Odaberite mjesec.</p>';
    return;
  }

  const [year, month] = monthValue.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  if (!calendarShifts[monthValue]) {
    calendarShifts[monthValue] = {};
  }

  const calendarMonthShifts = calendarShifts[monthValue];

  let html = '<table class="calendar"><thead><tr>';
  const daysOfWeek = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];
  daysOfWeek.forEach(d => html += `<th>${d}</th>`);
  html += '</tr></thead><tbody><tr>';

  let startWeekDay = firstDay.getDay();
  startWeekDay = startWeekDay === 0 ? 6 : startWeekDay - 1;

  for (let i = 0; i < startWeekDay; i++) {
    html += '<td></td>';
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    html += `<td data-date="${dateStr}"><div class="date">${day}</div>`;

    if (calendarMonthShifts[dateStr]) {
      calendarMonthShifts[dateStr].forEach(s => {
        html += `<div class="shift">${s.shiftType} (${s.startTime}-${s.endTime})</div>`;
      });
    }

    // Add select for adding shift
    html += `<select class="shiftSelect" data-date="${dateStr}">
               <option value="">Dodaj smjenu...</option>`;
    createdShifts.forEach((s, i) => {
      html += `<option value="${i}">${s.shiftType} (${s.startTime}-${s.endTime})</option>`;
    });
    html += '</select>';

    html += '</td>';

    if ((startWeekDay + day) % 7 === 0 && day !== lastDay.getDate()) {
      html += '</tr><tr>';
    }
  }

  const cellsInLastRow = (startWeekDay + lastDay.getDate()) % 7;
  if (cellsInLastRow !== 0) {
    for (let i = cellsInLastRow; i < 7; i++) {
      html += '<td></td>';
    }
  }

  html += '</tr></tbody></table>';

  calendarContainer.innerHTML = html;

  document.querySelectorAll('.shiftSelect').forEach(select => {
    select.addEventListener('change', () => {
      const date = select.dataset.date;
      const shiftIndex = select.value;
      if (shiftIndex === '') return;

      const shift = createdShifts[shiftIndex];

      if (!calendarMonthShifts[date]) calendarMonthShifts[date] = [];

      if (!calendarMonthShifts[date].some(s => s.shiftType === shift.shiftType && s.startTime === shift.startTime && s.endTime === shift.endTime)) {
        calendarMonthShifts[date].push(shift);
      }

      select.value = '';

      renderCalendar();
    });
  });
}

// Update summary info and chart
function updateSummary() {
  let totalHours = 0;
  let totalPay = 0;

  // Aggregate all months' data
  Object.values(calendarShifts).forEach(monthObj => {
    Object.values(monthObj).forEach(shiftsArray => {
      shiftsArray.forEach(s => {
        totalHours += s.duration;
        totalPay += s.duration * s.hourlyRate + s.bonus;
      });
    });
  });

  totalHoursElem.textContent = `Ukupno sati: ${totalHours.toFixed(2)}`;
  totalPayElem.textContent = `Ukupno plaća (€): ${totalPay.toFixed(2)}`;

  // Render chart
  renderChart(totalHours, totalPay);
}

// Render Chart.js bar chart
function renderChart(hours, pay) {
  if (summaryChart) {
    summaryChart.destroy();
  }

  summaryChart = new Chart(summaryChartCtx, {
    type: 'bar',
    data: {
      labels: ['Ukupno sati', 'Ukupna plaća (€)'],
      datasets: [{
        label: 'Vrijednosti',
        data: [hours, pay],
        backgroundColor: ['#4caf50', '#2196f3']
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: context => {
              if (context.dataIndex === 0) return `Sati: ${context.parsed.y.toFixed(2)}`;
              if (context.dataIndex === 1) return `€: ${context.parsed.y.toFixed(2)}`;
              return context.parsed.y;
            }
          }
        }
      }
    }
  });
}

loadShifts();

