const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

const shiftForm = document.getElementById("shiftForm");
const shiftList = document.getElementById("shiftList");
const monthSelect = document.getElementById("monthSelect");
const calendarContainer = document.getElementById("calendarContainer");
const totalHoursElem = document.getElementById("totalHours");
const totalPayElem = document.getElementById("totalPay");
const totalBonusElem = document.getElementById("totalBonus");
const totalOvertimeElem = document.getElementById("totalOvertime");

let createdShifts = [];
let calendarShifts = {};
let summaryChart = null;


tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    tabContents.forEach(tc => {
      tc.style.display = tc.id === tab.dataset.tab ? "block" : "none";
    });

    if (tab.dataset.tab === "calendar") renderCalendar();
    if (tab.dataset.tab === "summary") updateSummary();
  });
});


shiftForm.addEventListener("submit", e => {
  e.preventDefault();
  const shiftType = document.getElementById("shiftType").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const hourlyRate = parseFloat(document.getElementById("hourlyRate").value) || 0;
  const bonus = parseFloat(document.getElementById("bonus").value) || 0;

  if (!shiftType || !startTime || !endTime) return alert("Molimo popunite sva polja.");

  const duration = calculateDuration(startTime, endTime);
  createdShifts.push({ shiftType, startTime, endTime, hourlyRate, bonus, duration });
  renderShiftList();
  shiftForm.reset();
});

function calculateDuration(startTime, endTime) {
  const [startH, startM] = startTime.split(":" ).map(Number);
  const [endH, endM] = endTime.split(":" ).map(Number);
  let start = startH + startM / 60;
  let end = endH + endM / 60;
  if (end < start) end += 24;
  return +(end - start).toFixed(2);
}

function renderShiftList() {
  shiftList.innerHTML = "";
  createdShifts.forEach((s, i) => {
    const li = document.createElement("li");
    li.textContent = `${s.shiftType} | ${s.startTime} - ${s.endTime} | €${s.hourlyRate}/h | Bonus: €${s.bonus.toFixed(2)} | Trajanje: ${s.duration} h`;
    const btnDel = document.createElement("button");
    btnDel.textContent = "Izbriši";
    btnDel.style.marginLeft = "10px";
    btnDel.addEventListener("click", () => {
      createdShifts.splice(i, 1);
      renderShiftList();
    });
    li.appendChild(btnDel);
    shiftList.appendChild(li);
  });
}


monthSelect.addEventListener("change", renderCalendar);

function renderCalendar() {
  const monthValue = monthSelect.value;
  if (!monthValue) {
    calendarContainer.innerHTML ;
    return;
  }

  const [year, month] = monthValue.split("-" ).map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  let html = '<table class="calendar"><thead><tr>';
  const daysOfWeek = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];
  for (const d of daysOfWeek) html += `<th>${d}</th>`;
  html += "</tr></thead><tbody><tr>";

  let startWeekDay = firstDay.getDay();
  startWeekDay = startWeekDay === 0 ? 6 : startWeekDay - 1;
  for (let i = 0; i < startWeekDay; i++) html += "<td></td>";

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    html += `<td data-date="${dateStr}"><div class="date">${day}</div>`;

    if (calendarShifts[dateStr]) {
      calendarShifts[dateStr].forEach((s, idx) => {
        html += `<div class="shift">${s.shiftType} (${s.startTime}-${s.endTime}) <button class="delShift" data-date="${dateStr}" data-index="${idx}">🗑</button></div>`;
      });
    }

    html += `<select class="shiftSelect" data-date="${dateStr}"><option value="">Dodaj smjenu...</option>`;
    createdShifts.forEach((s, i) => {
      html += `<option value="${i}">${s.shiftType} (${s.startTime}-${s.endTime})</option>`;
    });
    html += "</select></td>";

    if ((startWeekDay + day) % 7 === 0 && day !== lastDay.getDate()) html += "</tr><tr>";
  }

  const cellsInLastRow = (startWeekDay + lastDay.getDate()) % 7;
  if (cellsInLastRow !== 0) {
    for (let i = cellsInLastRow; i < 7; i++) html += "<td></td>";
  }
  html += "</tr></tbody></table>";
  calendarContainer.innerHTML = html;

  document.querySelectorAll(".shiftSelect").forEach(select => {
    select.addEventListener("change", () => {
      const date = select.dataset.date;
      const shiftIndex = select.value;
      if (shiftIndex === "") return;
      const shift = createdShifts[shiftIndex];
      if (!calendarShifts[date]) calendarShifts[date] = [];

      if (!calendarShifts[date].some(s => 
        s.shiftType === shift.shiftType && 
        s.startTime === shift.startTime && 
        s.endTime === shift.endTime
      )) {
        calendarShifts[date].push(shift);
      }
      renderCalendar();
    });
  });

  document.querySelectorAll(".delShift").forEach(btn => {
    btn.addEventListener("click", () => {
      const date = btn.dataset.date;
      const index = btn.dataset.index;
      calendarShifts[date].splice(index, 1);
      if (calendarShifts[date].length === 0) delete calendarShifts[date];
      renderCalendar();
    });
  });
}


let summaryData = {
  days: [],
  pay: [],
  hours: [],
  overtime: [],
  bonus: []
};

function updateSummary() {
  summaryData = {
    days: [],
    pay: [],
    hours: [],
    overtime: [],
    bonus: []
  };

  let totalPay = 0, totalHours = 0, totalBonus = 0;
 

  for (const date in calendarShifts) {
    let dailyPay = 0, dailyHours = 0, dailyBonus = 0;

    calendarShifts[date].forEach(s => {
      dailyHours += s.duration;
      dailyBonus += s.bonus;
      dailyPay += s.duration * s.hourlyRate;
    });

    summaryData.days.push(date);
    summaryData.pay.push((dailyPay + dailyBonus).toFixed(2));
    summaryData.hours.push(dailyHours.toFixed(2));
    summaryData.bonus.push(dailyBonus.toFixed(2));
    summaryData.overtime.push(Math.max(0, dailyHours - 8).toFixed(2));

    totalPay += +dailyPay + +dailyBonus;
    totalHours += +dailyHours;
    totalBonus += +dailyBonus;
  }

  document.getElementById("totalPay").textContent = `Ukupno plaća (€): ${totalPay.toFixed(2)}`;
  document.getElementById("totalHours").textContent = `Ukupno sati: ${totalHours.toFixed(2)}`;
   document.getElementById("totalBonus").textContent = `Ukupno bonusa: €${totalBonus.toFixed(2)}`;
  document.getElementById("totalOvertime").textContent = `Ukupno prekovremenih sati: ${summaryData.overtime.reduce((acc, h) => acc + parseFloat(h), 0).toFixed(2)}`;
}

function renderSummaryChart(type = "pay") {
  const ctx = document.getElementById("summaryChart").getContext("2d");
  if (summaryChart) summaryChart.destroy();

  let label = "";
  let data = [];
  let bgColor = "";

  if (type === "pay") {
    label = "Plaća (€)";
    data = summaryData.pay;
    bgColor = "#3498db";
  } else if (type === "hours") {
    label = "Sati";
    data = summaryData.hours;
    bgColor = "#2ecc71";
  } else if (type === "bonus") {
    label = "Bonus (€)";
    data = summaryData.bonus;
    bgColor = "#f39c12";
  } else if (type === "overtime") {
    label = "Prekovremeni sati";
    data = summaryData.overtime;
    bgColor = "#e74c3c";
  }

  summaryChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: summaryData.days,
      datasets: [{
        label: label,
        data: data,
        backgroundColor: bgColor
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: label }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
document.querySelectorAll(".chart-toggle button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chart-toggle button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderSummaryChart(btn.dataset.type);
  });
});


loadShifts();

