document.addEventListener('DOMContentLoaded', () => {
    // Views
    const mainView = document.getElementById('main-view');
    const resultView = document.getElementById('result-view');
    const settingsView = document.getElementById('settings-view');
    const views = { 'main-view': mainView, 'result-view': resultView, 'settings-view': settingsView };

    // Buttons
    const boughtBtn = document.getElementById('bought-btn');
    const refusedBtn = document.getElementById('refused-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const saveGoalBtn = document.getElementById('save-goal-btn');
    const backBtns = document.querySelectorAll('.back-btn');

    // Data Elements
    const totalCo2El = document.getElementById('total-co2');
    const goalInput = document.getElementById('goal-input');

    // Result View Elements
    const resultMessageLarge = document.getElementById('result-message-large');
    const currentBar = document.getElementById('current-bar');
    const currentCount = document.getElementById('current-count');
    const goalBar = document.getElementById('goal-bar');
    const goalCount = document.getElementById('goal-count');
    const resultComment = document.getElementById('result-comment');

    // Constants
    const CO2_SAVED_PER_REFUSAL = 61;

    // App State
    let totalCo2Saved = 0;
    let refusalCount = 0;
    let monthlyGoal = 20; // Default goal

    // --- Functions ---

    function showView(viewId) {
        Object.values(views).forEach(view => view.classList.add('hidden'));
        if (views[viewId]) {
            views[viewId].classList.remove('hidden');
        }
    }

    function loadData() {
        totalCo2Saved = parseInt(localStorage.getItem('totalCo2Saved') || '0', 10);
        refusalCount = parseInt(localStorage.getItem('refusalCount') || '0', 10);
        monthlyGoal = parseInt(localStorage.getItem('monthlyGoal') || '20', 10);
        updateMainDisplay();
    }

    function updateMainDisplay() {
        totalCo2El.textContent = totalCo2Saved;
    }

    function updateResultView(action) {
        if (action === 'refused') {
            resultMessageLarge.textContent = `${CO2_SAVED_PER_REFUSAL}g のCO2を削減！`;
        } else {
            resultMessageLarge.textContent = 'また次の機会に！';
        }

        // Update graph
        const currentVal = refusalCount;
        const goalVal = monthlyGoal;

        // Prevent division by zero and calculate height percentage
        let currentHeight = 0;
        if (goalVal > 0) {
            currentHeight = Math.min((currentVal / goalVal) * 100, 100);
        }
        
        currentBar.style.height = `${currentHeight}%`;
        currentCount.textContent = currentVal;
        goalBar.style.height = '100%';
        goalCount.textContent = goalVal;

        // Update comment
        if (currentVal >= goalVal) {
            resultComment.textContent = '素晴らしい！今月の目標を達成しました！🎉';
        } else {
            const remaining = goalVal - currentVal;
            resultComment.textContent = `目標達成まであと ${remaining} 回！`;
        }
        showView('result-view');
    }

    // --- Event Listeners ---

    boughtBtn.addEventListener('click', () => {
        updateResultView('bought');
    });

    refusedBtn.addEventListener('click', () => {
        refusalCount++;
        totalCo2Saved += CO2_SAVED_PER_REFUSAL;

        localStorage.setItem('refusalCount', refusalCount);
        localStorage.setItem('totalCo2Saved', totalCo2Saved);

        updateMainDisplay();
        updateResultView('refused');
    });

    settingsBtn.addEventListener('click', () => {
        goalInput.value = monthlyGoal;
        showView('settings-view');
    });

    saveGoalBtn.addEventListener('click', () => {
        const newGoal = parseInt(goalInput.value, 10);
        if (newGoal && newGoal > 0) {
            monthlyGoal = newGoal;
            localStorage.setItem('monthlyGoal', monthlyGoal);
            showView('main-view');
        } else {
            alert('有効な数値を入力してください。');
        }
    });

    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.getAttribute('data-target');
            showView(targetView);
        });
    });

    // --- Initial Load ---
    loadData();
    showView('main-view');
});