// Sample Test Data
const testData = {
    Biology: {
        'Chapter 1': [
            {
                question: 'What is the powerhouse of the cell?',
                options: ['Mitochondria', 'Ribosome', 'Nucleus', 'Chloroplast'],
                correct: 0
            },
            {
                question: 'Which is the longest bone in human body?',
                options: ['Femur', 'Tibia', 'Humerus', 'Fibula'],
                correct: 0
            }
            // Add more questions...
        ]
    }
};

let currentTest = {
    subject: '',
    chapter: '',
    questions: [],
    userAnswers: [],
    currentQuestionIndex: 0,
    timerInterval: null
};

function showChapters(subject) {
    const chapters = Object.keys(testData[subject]);
    const chaptersHTML = chapters.map(chapter => `
        <button class="chapter-btn" 
            onclick="startTest('${subject}', '${chapter}')">
            ${chapter} - Start Test
        </button>
    `).join('');
    document.getElementById('chaptersContainer').innerHTML = chaptersHTML;
}

function startTest(subject, chapter) {
    currentTest = {
        subject,
        chapter,
        questions: testData[subject][chapter],
        userAnswers: testData[subject][chapter].map(() => ({
            selected: null,
            marked: false
        })),
        currentQuestionIndex: 0,
        timerInterval: null
    };

    document.getElementById('homepage').style.display = 'none';
    document.getElementById('testPage').style.display = 'block';
    document.getElementById('testTitle').textContent = `${subject} - ${chapter}`;
    startTimer(4 * 60 * 60);
    renderQuestion();
}

function startTimer(seconds) {
    let remaining = seconds;
    currentTest.timerInterval = setInterval(() => {
        remaining--;
        const hours = Math.floor(remaining / 3600);
        const mins = Math.floor((remaining % 3600) / 60);
        const secs = remaining % 60;
        document.getElementById('time').textContent = 
            `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        if (remaining <= 0) submitTest();
    }, 1000);
}

function renderQuestion() {
    const { currentQuestionIndex } = currentTest;
    const question = currentTest.questions[currentQuestionIndex];
    const userAnswer = currentTest.userAnswers[currentQuestionIndex];
    
    const questionHTML = `
        <div class="question-card">
            <h3 class="question-text">Q${currentQuestionIndex + 1}: ${question.question}</h3>
            ${question.options.map((opt, optIndex) => `
                <button class="option-btn ${userAnswer.selected === optIndex ? 'selected' : ''}"
                    onclick="selectAnswer(${optIndex})">
                    ${String.fromCharCode(65 + optIndex)}) ${opt}
                </button>
            `).join('')}
            <div class="controls">
                <button class="action-btn btn-secondary" onclick="toggleMark()">
                    ${userAnswer.marked ? 'Unmark Review' : 'Mark for Review'}
                </button>
                <div>
                    ${currentQuestionIndex > 0 ? `
                        <button class="action-btn btn-primary" onclick="navigateQuestion(-1)">Previous</button>
                    ` : ''}
                    <button class="action-btn btn-primary" onclick="saveAndNext()">
                        ${currentQuestionIndex === currentTest.questions.length - 1 ? 'Submit' : 'Save & Next'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('questionsContainer').innerHTML = questionHTML;
    renderNavigationGrid();
}

function selectAnswer(optIndex) {
    currentTest.userAnswers[currentTest.currentQuestionIndex].selected = optIndex;
    renderNavigationGrid();
}

function toggleMark() {
    const currentIndex = currentTest.currentQuestionIndex;
    currentTest.userAnswers[currentIndex].marked = 
        !currentTest.userAnswers[currentIndex].marked;
    renderNavigationGrid();
}

function navigateQuestion(direction) {
    currentTest.currentQuestionIndex += direction;
    renderQuestion();
}

function saveAndNext() {
    if (currentTest.currentQuestionIndex < currentTest.questions.length - 1) {
        currentTest.currentQuestionIndex++;
        renderQuestion();
    } else {
        submitTest();
    }
}

function jumpToQuestion(index) {
    currentTest.currentQuestionIndex = index;
    renderQuestion();
}

function renderNavigationGrid() {
    const gridHTML = currentTest.questions.map((_, index) => {
        const userAnswer = currentTest.userAnswers[index];
        const classes = [
            'question-number',
            index === currentTest.currentQuestionIndex ? 'current' : '',
            userAnswer.selected !== null ? 'answered' : '',
            userAnswer.marked ? 'marked' : ''
        ].filter(c => c).join(' ');
        
        return `<div class="${classes}" onclick="jumpToQuestion(${index})">${index + 1}</div>`;
    }).join('');
    
    document.getElementById('navigationGrid').innerHTML = gridHTML;
}

function submitTest() {
    clearInterval(currentTest.timerInterval);
    
    const score = currentTest.userAnswers.reduce((acc, answer, index) => {
        return acc + (answer.selected === currentTest.questions[index].correct ? 1 : 0);
    }, 0);

    showResults(score);
}

function showResults(score) {
    document.getElementById('testPage').style.display = 'none';
    document.getElementById('resultsPage').style.display = 'block';

    const resultsHTML = currentTest.questions.map((q, index) => {
        const userAnswer = currentTest.userAnswers[index];
        const isCorrect = userAnswer.selected === q.correct;
        return `
            <div class="question-result">
                <h4>Q${index + 1}: ${q.question}</h4>
                <p class="${isCorrect ? 'correct' : 'incorrect'}">
                    Your Answer: ${q.options[userAnswer.selected] || 'Not answered'}
                </p>
                ${!isCorrect ? `
                    <p class="correct">Correct Answer: ${q.options[q.correct]}</p>
                ` : ''}
            </div>
        `;
    }).join('');

    document.getElementById('scoreSummary').innerHTML = `
        <h3>Score: ${score}/${currentTest.questions.length}</h3>
        <p>Accuracy: ${((score / currentTest.questions.length) * 100).toFixed(1)}%</p>
    `;

    document.getElementById('detailedResults').innerHTML = resultsHTML;
    renderChart(score, currentTest.questions.length - score);
}

function renderChart(correct, incorrect) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Correct', 'Incorrect'],
            datasets: [{
                data: [correct, incorrect],
                backgroundColor: [ '#10b981', '#ef4444']
            }]
        }
    });
}

function restartTest() {
    startTest(currentTest.subject, currentTest.chapter);
    document.getElementById('resultsPage').style.display = 'none';
}

function goHome() {
    document.getElementById('resultsPage').style.display = 'none';
    document.getElementById('homepage').style.display = 'block';
}