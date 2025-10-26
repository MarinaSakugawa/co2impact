document.addEventListener('DOMContentLoaded', () => {
    const boughtBtn = document.getElementById('bought-btn');
    const refusedBtn = document.getElementById('refused-btn');
    const resultArea = document.getElementById('result-area');
    const resultMessage = document.getElementById('result-message');
    const equivalentMessage = document.getElementById('equivalent-message');
    const totalCo2El = document.getElementById('total-co2');

    const CO2_SAVED_PER_REFUSAL = 61; // 1回あたりのCO2削減量 (g)
    const KM_PER_GRAM_CO2 = 0.4 / 61; // 1gあたりの走行距離換算 (km)

    let totalCo2Saved = 0;

    // 1. 初期化: localStorageから累計を読み込む
    function initializeTotal() {
        const savedTotal = localStorage.getItem('totalCo2Saved');
        if (savedTotal) {
            totalCo2Saved = parseInt(savedTotal, 10);
        }
        updateTotalDisplay();
    }

    // 累計表示を更新する関数
    function updateTotalDisplay() {
        totalCo2El.textContent = totalCo2Saved;
    }

    // 「I bought one」ボタンの処理
    boughtBtn.addEventListener('click', () => {
        resultMessage.textContent = 'Let\'s try again next time!';
        equivalentMessage.textContent = '';
        resultArea.style.backgroundColor = '#fff3e0'; // Light orange background
    });

    // 「I refused one」ボタンの処理
    refusedBtn.addEventListener('click', () => {
        // 4. メッセージを表示
        resultMessage.textContent = `You saved ${CO2_SAVED_PER_REFUSAL}g of CO2!`;
        
        // 5. 換算結果を計算して表示
        const equivalentKm = (CO2_SAVED_PER_REFUSAL * KM_PER_GRAM_CO2).toFixed(1);
        equivalentMessage.textContent = `Equivalent to a ${equivalentKm}km drive.`;

        resultArea.style.backgroundColor = '#e8f5e9'; // Light green background

        // 7. 累計を更新して保存
        totalCo2Saved += CO2_SAVED_PER_REFUSAL;
        localStorage.setItem('totalCo2Saved', totalCo2Saved);
        updateTotalDisplay();
    });

    // ページ読み込み時に累計を初期化
    initializeTotal();
});
