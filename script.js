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
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Modal
    const modalOverlay = document.getElementById('modal-overlay');
    const graphTiles = document.querySelectorAll('.tile');

    // Data Elements
    const totalCo2El = document.getElementById('total-co2');
    const goalInput = document.getElementById('goal-input');

    // Result View Elements
    const resultMessageLarge = document.getElementById('result-message-large');
    const bar1 = document.getElementById('bar-1');
    const bar1Value = document.getElementById('bar-1-value');
    const bar1Label = document.getElementById('bar-1-label');
    const bar2 = document.getElementById('bar-2');
    const bar2Value = document.getElementById('bar-2-value');
    const bar2Label = document.getElementById('bar-2-label');
    const resultComment = document.getElementById('result-comment');

    // Constants
    const CO2_SAVED_PER_REFUSAL = 61;

    // App State
    let totalCo2Saved = 0;
    let refusalCount = 0;
    let boughtCount = 0;
    let monthlyGoal = 20; // Default goal
    let currentGraphType = 'goal'; // 'goal' or 'whatIf'

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
        boughtCount = parseInt(localStorage.getItem('boughtCount') || '0', 10);
        monthlyGoal = parseInt(localStorage.getItem('monthlyGoal') || '20', 10);
        currentGraphType = localStorage.getItem('currentGraphType') || 'goal';
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

        if (currentGraphType === 'whatIf') {
            drawWhatIfGraph();
        } else { // Default to 'goal'
            drawGoalGraph();
        }
        showView('result-view');
    }

    function drawGoalGraph() {
        const currentVal = refusalCount;
        const goalVal = monthlyGoal;

        let currentHeight = (goalVal > 0) ? Math.min((currentVal / goalVal) * 100, 100) : 0;

        bar1.style.height = `${currentHeight}%`;
        bar1Value.textContent = currentVal;
        bar1Label.textContent = '現在';

        bar2.style.height = '100%';
        bar2Value.textContent = goalVal;
        bar2Label.textContent = '目標';

        if (currentVal >= goalVal) {
            resultComment.textContent = '素晴らしい！今月の目標を達成しました！🎉';
        } else {
            const remaining = goalVal - currentVal;
            resultComment.textContent = `目標達成まであと ${remaining} 回！`;
        }
    }

    function drawWhatIfGraph() {
        const totalActions = refusalCount + boughtCount;
        const maxEmission = totalActions * CO2_SAVED_PER_REFUSAL;
        const currentSavings = refusalCount * CO2_SAVED_PER_REFUSAL;

        let savingsHeight = (maxEmission > 0) ? (currentSavings / maxEmission) * 100 : 0;

        bar1.style.height = `${savingsHeight}%`;
        bar1Value.textContent = `${currentSavings}g`;
        bar1Label.textContent = '現在のあなたの選択';

        bar2.style.height = '100%';
        bar2Value.textContent = `${maxEmission}g`;
        bar2Label.textContent = 'もし全部買っていたら';

        const difference = maxEmission - currentSavings;
        resultComment.textContent = `もし全部買っていたら、今より ${difference}g 多くのCO2が排出されていました。`;
    }

    function toggleModal(show) {
        modalOverlay.classList.toggle('hidden', !show);
    }

    // --- Event Listeners ---

    boughtBtn.addEventListener('click', () => {
        boughtCount++;
        localStorage.setItem('boughtCount', boughtCount);
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

    hamburgerBtn.addEventListener('click', () => toggleModal(true));
    closeModalBtn.addEventListener('click', () => toggleModal(false));
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            toggleModal(false);
        }
    });

    graphTiles.forEach(tile => {
        tile.addEventListener('click', () => {
            const type = tile.getAttribute('data-graph-type');
            if (type && type !== 'impact') { // 'impact' is disabled for now
                currentGraphType = type;
                localStorage.setItem('currentGraphType', currentGraphType);
                toggleModal(false);
                // If already on result view, redraw to reflect the change
                if (!resultView.classList.contains('hidden')) {
                    updateResultView();
                }
            }
        });
    });

    // --- Initial Load ---
    loadData();
    showView('main-view');
});
