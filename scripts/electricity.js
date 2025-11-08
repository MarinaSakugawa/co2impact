// 電力ページに関するスクリプトを実装

function initializeElectricityApp() {
    // 沖縄電力の事業者全体のCO2排出係数を参考2024年版
    const CO2_FACTOR = 0.677;

    // 各月のデータを取得する
    const monthInputs = [];
    for (let i = 1; i <= 12; i++) {
        monthInputs.push(document.getElementById(`month-${i}`));
    }

    // 要素の取得
    const totalKwhEl = document.getElementById('total-kwh');
    const totalCo2KgEl = document.getElementById('total-co2-kg');
    const saveBtn = document.getElementById('save-electricity-data-btn');

    let electricityChart = null;
    let co2Chart = null;

    // ローカルストレージを使ってデータを読み込む
    function loadData() {
        const savedData = JSON.parse(localStorage.getItem('electricityData') || '[]');
        monthInputs.forEach((input, index) => {
            input.value = savedData[index] || '';
        });
        updateChart();
        updateSummary();
    }

    // データをローカルストレージに保存する
    function saveData() {
        const data = monthInputs.map(input => parseFloat(input.value) || 0);
        localStorage.setItem('electricityData', JSON.stringify(data));
        alert('データを保存しました！');
    }

    // サマリーを更新する
    function updateSummary() {
        const data = monthInputs.map(input => parseFloat(input.value) || 0);
        const totalKwh = data.reduce((sum, val) => sum + val, 0);
        const totalCo2 = totalKwh * CO2_FACTOR;

        totalKwhEl.textContent = totalKwh.toFixed(1);
        if (totalCo2KgEl) {
            totalCo2KgEl.textContent = totalCo2.toFixed(1);
        }
    }

    // チャートを更新する
    function updateChart() {
        const data = monthInputs.map(input => parseFloat(input.value) || 0);
        const co2Data = data.map(kwh => kwh * CO2_FACTOR);

        // 電気使用量チャート
        const ctxElectricity = document.getElementById('electricity-chart');

        if (electricityChart) {
            electricityChart.destroy();
        }

        electricityChart = new Chart(ctxElectricity, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                datasets: [{
                    label: '電力使用量 (kWh)',
                    data: data,
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: false
                        },
                        min: 0
                    }
                }
            }
        });

        // CO2排出量チャート
        const ctxCo2 = document.getElementById('co2-chart');

        if (co2Chart) {
            co2Chart.destroy();
        }

        co2Chart = new Chart(ctxCo2, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                datasets: [{
                    label: 'CO2排出量 (kg)',
                    data: co2Data,
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: false
                        },
                        min: 0
                    }
                }
            }
        });
    }

    // イベントリスナーの設定
    monthInputs.forEach(input => {
        input.addEventListener('input', () => {
            // マイナス値を防ぐ
            if (input.value !== '' && parseFloat(input.value) < 0) {
                input.value = 0;
            }
            updateChart();
            updateSummary();
        });
    });

    saveBtn.addEventListener('click', saveData);

    // 初期データの読み込み
    loadData();
}
