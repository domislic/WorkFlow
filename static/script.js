const form = document.getElementById('shiftForm');
const tableBody = document.querySelector('#shiftsTable tbody');

function calculateDuration(startTime, endTime) {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  let start = startH + startM / 60;
  let end = endH + endM / 60;

  if (end < start) {
    end += 24;
  }
  return (end - start).toFixed(2);
}

form.addEventListener('submit', async e => {
  e.preventDefault();

  const date = form.date.value;
  const startTime = form.startTime.value;
  const endTime = form.endTime.value;
  const shiftType = form.shiftType.value;
  const pay = parseFloat(form.pay.value).toFixed(2);

  const startDateTime = `${date}T${startTime}:00`;
  const endDateTime = `${date}T${endTime}:00`;

  const shiftData = {
    start_time: startDateTime,
    end_time: endDateTime,
    shift_type: shiftType,
    pay_for_shift: parseFloat(pay),
    day_of_week: new Date(date).toLocaleDateString('hr-HR', { weekday: 'long' })
  };

  try {
    const response = await fetch('/shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shiftData)
    });

    if (!response.ok) {
      throw new Error('Greška prilikom dodavanja smjene');
    }

  
    const duration = calculateDuration(startTime, endTime);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${date}</td>
      <td>${startTime}</td>
      <td>${endTime}</td>
      <td>${shiftType}</td>
      <td>${pay}</td>
      <td>${duration}</td>
    `;
    tableBody.appendChild(row);

    form.reset();
  } catch (error) {
    alert(error.message);
  }
});

async function loadShifts() {
  try {
    const response = await fetch('/payment'); 
    if (!response.ok) {
      throw new Error('Greška pri dohvaćanju smjena');
    }

    const data = await response.json();

    data.forEach(item => {
      const shift = item.shift;
      const startDateTime = new Date(shift.start_time);
      const endDateTime = new Date(shift.end_time);

      const date = startDateTime.toISOString().slice(0, 10);
      const startTime = startDateTime.toTimeString().slice(0,5);
      const endTime = endDateTime.toTimeString().slice(0,5);
      const shiftType = shift.shift_type;
      const pay = shift.pay_for_shift.toFixed(2);

      const duration = calculateDuration(startTime, endTime);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${date}</td>
        <td>${startTime}</td>
        <td>${endTime}</td>
        <td>${shiftType}</td>
        <td>${pay}</td>
        <td>${duration}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    alert(error.message);
  }
}

loadShifts();
