let timerInterval = null;
let timeLeft = 0;

function startTimer(durationInSeconds) {
    timeLeft = durationInSeconds;
    updateTimerDisplay();
    
    timerInterval = setInterval(function() {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('¡Tiempo terminado! El examen se enviará automáticamente.');
            document.querySelector('.btn-submit-exam').click();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    document.getElementById('examTime').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Cambiar color cuando quedan 5 minutos
    const timerElement = document.querySelector('.exam-timer');
    if (timeLeft <= 300) { // 5 minutos = 300 segundos
        timerElement.style.color = '#dc3545'; // Rojo
        timerElement.style.fontWeight = 'bold';
    } else {
        timerElement.style.color = '';
        timerElement.style.fontWeight = '';
    }
}