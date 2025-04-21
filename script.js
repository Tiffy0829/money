// script.js
const apiUrl = "https://script.google.com/macros/s/AKfycbwxohT6sZ_svkNePOqsE_HF3OcSCHbQX6RDAANtOASB5YiE5lbR3xVfe1zHK-jXlDDrmQ/exec";
const form = document.getElementById("recordForm");
const recordsContainer = document.getElementById("records");
const statsDiv = document.getElementById("stats");
let chart;

// 讀取資料
async function loadRecords() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    recordsContainer.innerHTML = "";
    let total = 0;
    const stats = {};

    for (let i = 1; i < data.length; i++) {
      const [date, category, amount, note] = data[i];
      const recordElement = document.createElement("div");
      recordElement.classList.add("record");
      recordElement.innerHTML = `
        <p><strong>日期：</strong>${date}</p>
        <p><strong>類別：</strong>${category}</p>
        <p><strong>金額：</strong>${amount}</p>
        <p><strong>備註：</strong>${note}</p>
        <button class="delete-btn" data-index="${i}">刪除</button>
      `;
      recordsContainer.appendChild(recordElement);

      if (category !== "收入") total += Number(amount);
      if (!stats[category]) stats[category] = 0;
      stats[category] += Number(amount);
    }

    statsDiv.textContent = `總支出：${total} 元`;
    drawChart(stats);
    addDeleteHandlers(data);
  } catch (error) {
    console.error("讀取紀錄錯誤：", error);
  }
}

// 新增記帳
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const amount = Number(document.getElementById("amount").value);
  const note = document.getElementById("note").value;

  await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({ date, category, amount, note }),
    headers: { "Content-Type": "application/json" },
    mode: "no-cors"
  });

  form.reset();
  setTimeout(loadRecords, 1000);
});

function drawChart(stats) {
  const ctx = document.getElementById("myChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(stats),
      datasets: [{
        data: Object.values(stats),
        backgroundColor: [
          "#f67280",
          "#c06c84",
          "#6c5b7b",
          "#355c7d",
          "#99b898",
          "#f8b195"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
}

// 刪除按鈕事件
function addDeleteHandlers(data) {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const index = e.target.dataset.index;
      await fetch(apiUrl + `?action=delete&row=${index}`, { method: "GET" });
      setTimeout(loadRecords, 1000);
    });
  });
}

// 載入時
window.addEventListener("load", loadRecords);
