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

form.addEventListener('submit', e => {
  e.preventDefault();

  const date = form.date.value;
  const startTime = form.startTime.value;
  const endTime = form.endTime.value;
  const shiftType = form.shiftType.value;
  const pay = parseFloat(form.pay.value).toFixed(2);

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
});
