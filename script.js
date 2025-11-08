document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');

    // --- Component Loading ---
    const loadComponent = async (componentName) => {
        try {
            const response = await fetch(`components/${componentName}.html`);
            if (!response.ok) {
                throw new Error(`Could not load ${componentName}.html`);
            }
            const html = await response.text();
            appContainer.innerHTML = html;

            // After loading the component, initialize its specific logic
            if (componentName === 'plastic_bag_app') {
                initializePlasticBagApp();
            } else if (componentName === 'electricity_app') {
                initializeElectricityApp();
            }
        } catch (error) {
            console.error('Failed to load component:', error);
            appContainer.innerHTML = `<p style="color: red; text-align: center;">Error loading content.</p>`;
        }
    };

    // --- Event Delegation ---
    appContainer.addEventListener('click', (e) => {
        const targetId = e.target.id;

        if (targetId === 'btn-plastic-bag') {
            loadComponent('plastic_bag_app');
        }

        if (targetId === 'btn-electricity') {
            loadComponent('electricity_app');
        }

        if (targetId === 'back-to-top-btn' || targetId === 'electricity-back-btn') {
            loadComponent('top_screen');
        }
    });

    // --- App-Specific Logic ---

    function initializePlasticBagApp() {
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
        const resetDataBtn = document.getElementById('reset-data-btn');

        // Modal
        const modalOverlay = document.getElementById('modal-overlay');
        const graphTiles = document.querySelectorAll('.tile');

        // Data Elements
        const totalCo2El = document.getElementById('total-co2');
        const refusalCountEl = document.getElementById('refusal-count');
        const boughtCountEl = document.getElementById('bought-count');
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
        const CO2_SAVED_PER_REFUSAL = 1.2;

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
            refusalCountEl.textContent = refusalCount;
            boughtCountEl.textContent = boughtCount;
        }

        function updateResultView(action) {
            if (action === 'refused') {
                resultMessageLarge.textContent = `${CO2_SAVED_PER_REFUSAL}g のCO2を削減！`;
            } else if (action === 'bought') {
                resultMessageLarge.textContent = 'また次の機会に！';
            }

            if (currentGraphType === 'whatIf') {
                drawWhatIfGraph();
            } else if (currentGraphType === 'impact') {
                drawImpactGraph();
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
            bar1.style.backgroundColor = '#4caf50';

            bar2.style.height = '100%';
            bar2Value.textContent = goalVal;
            bar2Label.textContent = '目標';
            bar2.style.backgroundColor = '#e0e0e0';

            if (currentVal >= goalVal) {
                resultComment.textContent = '素晴らしい！今月の目標を達成しました！🎉';
            } else {
                const remaining = goalVal - currentVal;
                resultComment.textContent = `目標達成まであと ${remaining} 回！`;
            }
        }

        function drawWhatIfGraph() {
            const totalActions = refusalCount + boughtCount;
            const potentialEmissions = totalActions * CO2_SAVED_PER_REFUSAL;
            const actualEmissions = boughtCount * CO2_SAVED_PER_REFUSAL;
            const savedAmount = refusalCount * CO2_SAVED_PER_REFUSAL;
            let actualEmissionHeight = (potentialEmissions > 0) ? (actualEmissions / potentialEmissions) * 100 : 0;

            bar1.style.height = `${actualEmissionHeight}%`;
            bar1Value.textContent = `${actualEmissions}g`;
            bar1Label.textContent = 'あなたの選択による排出量';
            bar1.style.backgroundColor = '#f44336';

            bar2.style.height = '100%';
            bar2Value.textContent = `${potentialEmissions}g`;
            bar2Label.textContent = 'もし全部買っていた場合';
            bar2.style.backgroundColor = '#e0e0e0';

            if (savedAmount > 0) {
                resultComment.textContent = `あなたの選択によって、${savedAmount}g のCO2を削減できました。素晴らしいです！`;
            } else {
                resultComment.textContent = 'レジ袋を断ると、CO2排出量を削減できます。';
            }
        }

        function drawImpactGraph() {
            const CO2_PER_TREE_YEAR = 22000;
            const CO2_PER_KM_DRIVEN = 120;
            const equivalentTrees = (totalCo2Saved / CO2_PER_TREE_YEAR).toFixed(2);
            const equivalentKm = (totalCo2Saved / CO2_PER_KM_DRIVEN).toFixed(2);

            bar1.style.height = '0%';
            bar1Value.textContent = '';
            bar1Label.textContent = '';
            bar2.style.height = '0%';
            bar2Value.textContent = '';
            bar2Label.textContent = '';

            resultMessageLarge.textContent = 'あなたの削減インパクト';
            resultComment.innerHTML = `
                <p>これまでに削減したCO2は、</p>
                <p>年間約 <strong>${equivalentTrees} 本</strong> の木が吸収するCO2に相当します。</p>
                <p>または、車で約 <strong>${equivalentKm} km</strong> 走行した際のCO2排出量に相当します。</p>
            `;
        }

        function toggleModal(show) {
            modalOverlay.classList.toggle('hidden', !show);
        }

        function resetData() {
            if (confirm('全てのデータをリセットしてもよろしいですか？この操作は元に戻せません。')) {
                localStorage.clear();
                totalCo2Saved = 0;
                refusalCount = 0;
                boughtCount = 0;
                monthlyGoal = 20;
                currentGraphType = 'goal';
                updateMainDisplay();
                showView('main-view');
                alert('データがリセットされました。');
            }
        }

        // --- Event Listeners (need to be attached to elements within the loaded component) ---

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
                if (targetView) {
                    showView(targetView);
                }
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
                if (type) {
                    currentGraphType = type;
                    localStorage.setItem('currentGraphType', currentGraphType);
                    toggleModal(false);
                    if (!resultView.classList.contains('hidden')) {
                        updateResultView();
                    }
                }
            });
        });

        resetDataBtn.addEventListener('click', resetData);

        // --- Initial Load for this component ---
        loadData();
        showView('main-view');
    }

    // --- Initial App Load ---
    loadComponent('top_screen');
});