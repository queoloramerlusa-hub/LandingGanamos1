document.addEventListener('DOMContentLoaded', () => {
    
    // --- Overlay & Form Logic ---
    const entryOverlay = document.getElementById('entry-overlay');
    const formStep = document.getElementById('form-step');
    const rouletteStep = document.getElementById('roulette-step');
    const winStep = document.getElementById('win-step');
    const entryForm = document.getElementById('entry-form');
    const userNameInput = document.getElementById('user-name');
    const mainContainer = document.getElementById('main-content');
    
    // Make sure overlay is visible on load
    entryOverlay.classList.add('active');

    // Handle Form Submission
    entryForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
        const name = userNameInput.value.trim();
        const phone = document.getElementById('user-phone').value.trim();
        
        if(name && phone) {
            // Update the win name placeholder
            document.getElementById('win-name').textContent = name;
            
            // Switch to roulette immediately so user doesn't wait
            formStep.classList.remove('active');
            rouletteStep.classList.add('active');

            // --- INTEGRACIÓN PARA VERCEL (SIN PHP) ---
            // Aquí debes colocar la URL que te da Formspree (o cualquier otro servicio de Webhook)
            const webhookUrl = 'https://formspree.io/f/mnjwdjor'; // REEMPLAZA ESTO
            
            fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    Nombre: name,
                    Telefono: phone
                })
            })
            .then(response => {
                if (response.ok) {
                    console.log("Datos enviados correctamente");
                }
            })
            .catch(error => {
                console.error("Error al guardar datos:", error);
            });
        }
    });

    // --- Roulette Logic ---
    const wheel = document.getElementById('wheel');
    const spinBtn = document.getElementById('spin-btn');
    const claimBtn = document.getElementById('claim-btn');
    const winPrizeText = document.getElementById('win-prize');

    const prizes = [
        { text: "BONO DEL 20%", chance: 40 },
        { text: "BONO DEL 25%", chance: 40 },
        { text: "BONO DEL 35%", chance: 18 },
        { text: "BONO DEL 100%", chance: 2 }
    ];

    let canSpin = true;

    spinBtn.addEventListener('click', () => {
        if (!canSpin) return;
        canSpin = false;
        
        // Spin the wheel randomly between 5 and 10 full rotations + extra degrees
        const spinDeg = Math.floor(Math.random() * 360) + (360 * 5); 
        wheel.style.transform = `rotate(${spinDeg}deg)`;
        
        // Wait for the CSS transition to finish (4 seconds)
        setTimeout(() => {
            // Pick a prize based on weighted probability
            let randomNum = Math.random() * 100;
            let wonPrize = prizes[0].text;
            let cumulative = 0;
            
            for (let i = 0; i < prizes.length; i++) {
                cumulative += prizes[i].chance;
                if (randomNum <= cumulative) {
                    wonPrize = prizes[i].text;
                    break;
                }
            }
            
            winPrizeText.textContent = wonPrize;

            // Switch steps
            rouletteStep.classList.remove('active');
            winStep.classList.add('active');
        }, 4000); 
    });

    // Handle claiming the prize and revealing the main site
    claimBtn.addEventListener('click', () => {
        entryOverlay.classList.remove('active');
        
        // Remove blur from main content
        mainContainer.style.filter = 'none';
        
        // Start the countdown and popups
        startMainSite();
    });

    // --- Main Site Logic (Countdown & Popups) ---
    function startMainSite() {
        // Countdown Timer
        let timeLeft = 90; // 1 minute 30 seconds
        const countdownEl = document.getElementById('countdown');

        const updateTimer = () => {
            const minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            
            seconds = seconds < 10 ? '0' + seconds : seconds;
            countdownEl.textContent = `0${minutes}:${seconds}`;

            if (timeLeft <= 15) {
                countdownEl.classList.add('warning');
            }

            if (timeLeft > 0) {
                timeLeft--;
            } else {
                countdownEl.textContent = "00:00";
                countdownEl.classList.add('warning');
                clearInterval(timerInterval);
            }
        };

        const timerInterval = setInterval(updateTimer, 1000);
        updateTimer(); 

        // Live Winners Popup
        const popupEl = document.getElementById('winner-popup');
        const wNameEl = document.getElementById('w-name');
        const wAmountEl = document.getElementById('w-amount');

        const firstNames = ['Juan', 'María', 'Carlos', 'Laura', 'Pedro', 'Ana', 'Diego', 'Sofía', 'Luis', 'Marta', 'Javier', 'Valentina'];
        const lastNamesInitial = ['P.', 'G.', 'R.', 'M.', 'L.', 'S.', 'F.', 'C.', 'V.', 'T.'];
        const games = ['en Slots', 'en la Ruleta', 'en el Jackpot', 'en Blackjack', 'en VIP Casino'];

        const showWinnerPopup = () => {
            const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNamesInitial[Math.floor(Math.random() * lastNamesInitial.length)]}`;
            let amount = Math.floor(Math.random() * (500000 - 10000 + 1)) + 10000;
            amount = Math.round(amount / 500) * 500;
            const formattedAmount = '$' + amount.toLocaleString('es-AR');
            const randomGame = games[Math.floor(Math.random() * games.length)];

            wNameEl.textContent = randomName;
            wAmountEl.innerHTML = `${formattedAmount} <br><span style="font-size:0.75rem; color:#ccc; font-weight:normal;">${randomGame}</span>`;

            popupEl.classList.add('show');

            setTimeout(() => {
                popupEl.classList.remove('show');
            }, 4000);
        };

        setTimeout(() => {
            showWinnerPopup();
            setInterval(() => {
                showWinnerPopup();
            }, Math.floor(Math.random() * 7000) + 8000);
        }, 2000);

        // CTA Shake effect
        const ctaBtn = document.getElementById('whatsapp-btn');
        ctaBtn.addEventListener('mouseenter', () => {
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        });
    }
});
