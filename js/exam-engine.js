document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const examCards = document.querySelectorAll('.exam-card');
    const examModal = document.getElementById('examModal');
    const resultsModal = document.getElementById('resultsModal');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const feedbackContainer = document.getElementById('feedbackContainer');
    const currentQuestionSpan = document.getElementById('currentQuestion');
    const finalScoreSpan = document.getElementById('finalScore');
    const correctAnswersSpan = document.getElementById('correctAnswers');
    const incorrectAnswersSpan = document.getElementById('incorrectAnswers');
    const timeUsedSpan = document.getElementById('timeUsed');
    const recommendationsList = document.getElementById('recommendationsList');
    const scoreMessage = document.getElementById('scoreMessage');
    
    // Variables del examen
    let currentExam = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let examStartTime = null;
    let examData = null;
    
    // Cargar datos del examen desde JSON
    fetch('../data/exam-questions.json')
        .then(response => response.json())
        .then(data => {
            examData = data;
        })
        .catch(error => console.error('Error loading exam data:', error));
    
    // Event listeners para los botones de inicio de examen
    examCards.forEach(card => {
        card.querySelector('.btn-start-exam').addEventListener('click', function() {
            const examNumber = parseInt(card.getAttribute('data-exam'));
            startExam(examNumber);
        });
    });
    
    // Función para iniciar un examen
    function startExam(examNumber) {
        currentExam = examNumber;
        currentQuestionIndex = 0;
        userAnswers = new Array(50).fill(null);
        examStartTime = new Date();
        
        // Mostrar el modal de examen
        examModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Iniciar temporizador
        startTimer(50 * 60); // 50 minutos en segundos
        
        // Cargar la primera pregunta
        loadQuestion();
    }
    
    // Función para cargar una pregunta
    function loadQuestion() {
        if (!examData || !currentExam) return;
        
        const examQuestions = examData[`exam${currentExam}`];
        const question = examQuestions[currentQuestionIndex];
        
        // Actualizar número de pregunta
        currentQuestionSpan.textContent = currentQuestionIndex + 1;
        
        // Mostrar el texto de la pregunta
        questionText.textContent = question.question;
        
        // Limpiar opciones anteriores
        optionsContainer.innerHTML = '';
        
        // Crear opciones de respuesta
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            if (userAnswers[currentQuestionIndex] === index) {
                optionElement.classList.add('selected');
            }
            optionElement.innerHTML = `
                <input type="radio" name="answer" id="option${index}" value="${index}">
                <label for="option${index}">${option.text}</label>
            `;
            
            optionElement.addEventListener('click', function() {
                selectOption(index);
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        // Mostrar retroalimentación si ya se respondió
        if (userAnswers[currentQuestionIndex] !== null) {
            showFeedback();
        } else {
            feedbackContainer.innerHTML = '';
        }
        
        // Actualizar estado de los botones
        updateNavigationButtons();
    }
    
    // Función para seleccionar una opción
    function selectOption(optionIndex) {
        userAnswers[currentQuestionIndex] = optionIndex;
        
        // Resaltar la opción seleccionada
        const options = document.querySelectorAll('.option');
        options.forEach((option, index) => {
            if (index === optionIndex) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Mostrar retroalimentación inmediata
        showFeedback();
    }
    
    // Función para mostrar retroalimentación
    function showFeedback() {
        if (!examData || !currentExam || userAnswers[currentQuestionIndex] === null) return;
        
        const examQuestions = examData[`exam${currentExam}`];
        const question = examQuestions[currentQuestionIndex];
        const userAnswerIndex = userAnswers[currentQuestionIndex];
        const isCorrect = userAnswerIndex === question.correctAnswer;
        
        feedbackContainer.innerHTML = `
            <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
                <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                <p>${question.feedback}</p>
                ${!isCorrect ? `<p class="correct-answer">Correct answer: ${question.options[question.correctAnswer].text}</p>` : ''}
            </div>
        `;
    }
    
    // Función para actualizar botones de navegación
    function updateNavigationButtons() {
        const prevButton = document.querySelector('.btn-prev-question');
        const nextButton = document.querySelector('.btn-next-question');
        
        prevButton.disabled = currentQuestionIndex === 0;
        nextButton.disabled = currentQuestionIndex === 49;
    }
    
    // Event listeners para navegación
    document.querySelector('.btn-prev-question').addEventListener('click', function() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion();
        }
    });
    
    document.querySelector('.btn-next-question').addEventListener('click', function() {
        if (currentQuestionIndex < 49) {
            currentQuestionIndex++;
            loadQuestion();
        }
    });
    
    // Event listener para finalizar examen
    document.querySelector('.btn-submit-exam').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres finalizar el examen? Podrás ver tus resultados.')) {
            finishExam();
        }
    });
    
    // Event listener para cerrar examen
    document.querySelector('.btn-close-exam').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres salir del examen? Tu progreso se perderá.')) {
            closeExam();
        }
    });
    
   function finishExam() {
  // Calcular resultados
  const examQuestions = examData[`exam${currentExam}`];
  let correctCount = 0;
  
  userAnswers.forEach((answer, index) => {
    if (answer === examQuestions[index].correctAnswer) {
      correctCount++;
    }
  });
  
  const score = Math.round((correctCount / examQuestions.length) * 100);
  const timeUsed = Math.floor((new Date() - examStartTime) / 1000);
  const minutes = Math.floor(timeUsed / 60);
  const seconds = timeUsed % 60;
  
  // Actualizar UI
  document.getElementById('finalScore').textContent = score;
  document.getElementById('correctAnswers').textContent = correctCount;
  document.getElementById('incorrectAnswers').textContent = examQuestions.length - correctCount;
  document.getElementById('timeUsed').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Establecer porcentaje para el círculo de puntaje
  document.querySelector('.score-circle').style.setProperty('--score-percent', `${score}%`);
  
  // Mostrar mensaje
  const scoreMessage = document.getElementById('scoreMessage');
  if (score >= 80) {
    scoreMessage.textContent = '¡Excelente trabajo! Estás listo para la certificación.';
  } else if (score >= 60) {
    scoreMessage.textContent = 'Buen intento, pero necesitas más práctica.';
  } else {
    scoreMessage.textContent = 'Necesitas más estudio antes de intentar el examen real.';
  }
  
  // Generar recomendaciones
  generateRecommendations(correctCount, examQuestions);
  
  // Mostrar resultados y ocultar examen
  document.getElementById('examModal').style.display = 'none';
  document.getElementById('resultsModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Detener temporizador
  stopTimer();
}
    
    // Función para generar recomendaciones
    function generateRecommendations(correctCount, questions) {
        recommendationsList.innerHTML = '';
        
        if (correctCount >= 45) {
            recommendationsList.innerHTML = `
                <li>Revisa las pocas preguntas que fallaste para asegurar un puntaje perfecto.</li>
                <li>Practica con los otros exámenes para confirmar tu preparación.</li>
                <li>Consulta la documentación oficial para detalles avanzados.</li>
            `;
        } else if (correctCount >= 35) {
            recommendationsList.innerHTML = `
                <li>Enfócate en los módulos donde tuviste más errores.</li>
                <li>Revisa los conceptos básicos de Mendix Studio y Mendix Studio Pro.</li>
                <li>Practica con los otros exámenes para mejorar tu puntaje.</li>
            `;
        } else {
            recommendationsList.innerHTML = `
                <li>Estudia los fundamentos de Mendix en la Academia Mendix.</li>
                <li>Revisa el manual de certificación cuidadosamente.</li>
                <li>Practica construyendo aplicaciones simples para entender los conceptos.</li>
                <li>Vuelve a intentar este examen después de estudiar.</li>
            `;
        }
        
        // Añadir recomendaciones específicas basadas en preguntas fallidas
        recommendationsList.innerHTML += `
            <li>Visita la <a href="https://docs.mendix.com/" target="_blank">documentación oficial</a> para temas difíciles.</li>
            <li>Completa los cursos relevantes en <a href="https://academy.mendix.com/" target="_blank">Mendix Academy</a>.</li>
        `;
    }
    
    // Función para cerrar el examen
    function closeExam() {
        stopTimer();
        examModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Event listeners para el modal de resultados
    document.querySelector('.btn-close-results').addEventListener('click', function() {
        resultsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    document.querySelector('.btn-review-exam').addEventListener('click', function() {
        resultsModal.style.display = 'none';
        examModal.style.display = 'block';
    });
});