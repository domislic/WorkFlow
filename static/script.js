const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
const shiftForm = document.getElementById("shiftForm");
const shiftList = document.getElementById("shiftList");
const monthSelect = document.getElementById("monthSelect");
const calendarContainer = document.getElementById("calendarContainer");
const totalHoursElem = document.getElementById("totalHours");
const totalPayElem = document.getElementById("totalPay");

let createdShifts = [];
let calendarShifts = {};
let summaryChart = null;

// --- TABS ---
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

// --- FORMA ZA DODAVANJE SMJENE ---
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
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
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

// --- KALENDAR ---
monthSelect.addEventListener("change", renderCalendar);

function renderCalendar() {
  const monthValue = monthSelect.value;
  if (!monthValue) {
    calendarContainer.innerHTML = "<p>Odaberite mjesec.</p>";
    return;
  }

  calendarShifts = {};
  const [year, month] = monthValue.split("-").map(Number);
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
      calendarShifts[dateStr].forEach(s => {
        html += `<div class="shift">${s.shiftType} (${s.startTime}-${s.endTime})</div>`;
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
      if (!calendarShifts[date].some(s => s.shiftType === shift.shiftType && s.startTime === shift.startTime && s.endTime === shift.endTime)) {
        calendarShifts[date].push(shift);
      }
      renderCalendar();
    });
  });
}

// --- SAZETAK ---
function updateSummary() {
  let totalHours = 0;
  let totalBonus = 0;
  let totalPay = 0;

  const days = [];
  const hours = [];
  const overtime = [];
  const bonuses = [];

  for (const date in calendarShifts) {
    let dailyHours = 0;
    let dailyBonus = 0;
    let dailyPay = 0;

    calendarShifts[date].forEach(s => {
      dailyHours += s.duration;
      dailyBonus += s.bonus;
      dailyPay += s.duration * s.hourlyRate;
    });

    totalHours += dailyHours;
    totalBonus += dailyBonus;
    totalPay += dailyPay + dailyBonus;

    days.push(date);
    hours.push(dailyHours);
    overtime.push(Math.max(0, dailyHours - 8));
    bonuses.push(dailyBonus);
  }

  totalHoursElem.textContent = `Ukupno sati: ${totalHours.toFixed(2)}`;
  totalPayElem.textContent = `Ukupno plaća (€): ${totalPay.toFixed(2)}`;

  if (summaryChart) summaryChart.destroy();

  const ctx = document.getElementById("summaryChart").getContext("2d");
  summaryChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: days,
      datasets: [
        {
          label: "Sati rada",
          data: hours,
          backgroundColor: "#4285F4"
        },
        {
          label: "Prekovremeni sati",
          data: overtime,
          backgroundColor: "#EA4335"
        },
        {
          label: "Bonusi (€)",
          data: bonuses,
          backgroundColor: "#34A853"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Rad po danima" }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Vrijednost"
          }
        }
      }
    }
  });
}

loadShifts();

