let quizData = [];
let currentQuestion = 0;
let timeLeft = 600;
let tabSwitches = 0;
let timerInterval;
let userAnswers = {};

document.addEventListener('visibilitychange', handleVisibilityChange);
document.addEventListener('copy', preventCopyPaste);
document.addEventListener('paste', preventCopyPaste);
document.addEventListener('contextmenu', preventRightClick);
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('DOMContentLoaded', disableCopyFeatures);
document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        alert('Developer tools disabled!');
    }
});


const supabaseUrl = 'https://mbeselfjwaarayjdrgoq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZXNlbGZqd2FhcmF5amRyZ29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjU1NTMsImV4cCI6MjA1Njc0MTU1M30.NapapfR7r-eaoRVWGFvC6lxXibG24X75iXhoelgSHNk';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let currentQuizId = null;

async function signIn() {
    const username = document.getElementById('signin-username').value;
    const password = document.getElementById('signin-password').value;
    
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    try {
        const passwordHash = btoa(password);

        // Fetch quizzes owned by the user with matching credentials
        const { data, error } = await supabase
            .from('quizzes')
            .select(`
                quiz_id, 
                created_at, 
                attempts (participant_name, score, attempted_at)
            `)
            .eq('owner_username', username)
            .eq('owner_password', passwordHash);

        if (error) throw error;
        
        if (!data || data.length === 0) {
            alert('Invalid credentials or no quizzes found');
            return;
        }

        // Clear previous results
        document.getElementById('quiz-results').innerHTML = '';
        
        // Hide other sections
        document.getElementById('signin-section').classList.add('hidden');
        document.getElementById('welcome-section').classList.add('hidden');
 
        // Show creator dashboard
        const creatorDashboard = document.getElementById('creator-dashboard');
        creatorDashboard.classList.remove('hidden');
        
        showCreatorDashboard(data);
        
    } catch (error) {
        console.error('Sign-in error:', error);
        alert('Sign-in failed: ' + error.message);
    }
}


function showCreatorDashboard(quizzes) {
    const resultsHTML = quizzes.map(quiz => {
        const attempts = quiz.attempts || [];
        
        return `
            <div class="quiz-result">
                <h3>Quiz ID: ${quiz.quiz_id}</h3>
                <p>Created: ${new Date(quiz.created_at).toLocaleDateString()}</p>
                ${attempts.length > 0 ? `
                    <div class="attempts-list">
                        ${attempts.map(attempt => `
                            <div class="attempt">
                                <span class="participant">${attempt.participant_name}</span>
                                <span class="score">Score: ${attempt.score}</span>
                                <span class="time">${new Date(attempt.attempted_at).toLocaleTimeString()}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p>No attempts yet</p>'}
            </div>
        `;
    }).join('');

    document.getElementById('quiz-results').innerHTML = resultsHTML;
}



function disableCopyFeatures() {
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
  
    document.addEventListener('copy', function(e) {
      e.preventDefault();
    });

    document.addEventListener('cut', function(e) {
      e.preventDefault();
    });
  }
  
function showCreateQuiz() {
    document.getElementById('welcome-section').classList.add('hidden');
    document.getElementById('create-quiz-section').classList.remove('hidden');
}

function showAttemptQuiz() {
    document.getElementById('welcome-section').classList.add('hidden');
    document.getElementById('attempt-quiz-section').classList.remove('hidden');
}

function preventCopyPaste(e) {
    e.preventDefault();
    showCheatWarning('Copying/pasting is disabled!');
}

function preventRightClick(e) {
    e.preventDefault();
    showCheatWarning('Right click disabled!');
}

function handleVisibilityChange() {
    if (document.hidden) {
        tabSwitches++;
        if (tabSwitches >= 2) {
            submitQuiz();
            alert('Quiz closed due to multiple tab switches!');
        } else {
            document.getElementById('remaining-attempts').textContent = 2 - tabSwitches;
            showCheatWarning('Tab switch detected!');
        }
    }
}

function showCheatWarning(message) {
    const warning = document.getElementById('cheat-warning');
    warning.textContent = `${message} Remaining attempts: ${2 - tabSwitches}`;
    warning.classList.remove('hidden');
    setTimeout(() => warning.classList.add('hidden'), 3000);
}

function startQuiz() {
    const fileInput = document.getElementById('csvInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please upload a CSV file');
        return;
    }

    parseCSV(file);
}

function parseCSV(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        quizData = e.target.result.split('\n')
            .filter(row => row.trim())
            .map(row => {
                const cols = row.split(',');
                return {
                    question: cols[0],
                    options: [cols[1], cols[2], cols[3], cols[4]],
                    answer: cols[5].trim()
                };
            });

        initializeQuiz();
    };
    
    reader.readAsText(file);
    return {
        question: cols[0],
        options: [cols[1], cols[2], cols[3], cols[4]],
        answer: cols[5].trim().toLowerCase() 
    };
}

// function initializeQuiz() {
//     document.getElementById('upload-section').classList.add('hidden');
//     document.getElementById('quiz-section').classList.remove('hidden');
//     userAnswers = {};
//     startTimer();
//     createNavigation();
//     showQuestion(currentQuestion);
// }
function initializeQuiz() {
    userAnswers = {};
    startTimer();
    createNavigation();
    showQuestion(currentQuestion);
}

function createNavigation() {
    const nav = document.getElementById('question-nav');
    nav.innerHTML = quizData.map((_, i) => `
        <button class="nav-btn ${i === 0 ? 'current' : ''}" 
                onclick="jumpToQuestion(${i})">
            ${i + 1}
        </button>
    `).join('');
}

function showQuestion(index) {
    currentQuestion = index;
    const question = quizData[index];
    const container = document.getElementById('question-container');
    
    container.innerHTML = `
        <h3>Question ${index + 1}</h3>
        <p>${question.question}</p>
        <div class="options">
            ${question.options.map((opt, i) => `
                <input type="radio" 
                    name="question${index}" 
                    id="q${index}o${i}" 
                    value="${String.fromCharCode(97 + i)}"
                    ${(userAnswers[index] || '').toLowerCase() === String.fromCharCode(97 + i) ? 'checked' : ''}
                    onchange="saveAnswer(${index}, '${String.fromCharCode(97 + i)}')">
                <label for="q${index}o${i}">${opt}</label><br>
            `).join('')}
        </div>
    `;

    updateNavigation();
    updateProgress();
}

function saveAnswer(index, answer) {
    userAnswers[index] = answer;
    document.querySelectorAll('.nav-btn')[index].classList.add('answered');
}

function jumpToQuestion(index) {
    currentQuestion = index;
    showQuestion(index);
}

function updateNavigation() {
    document.querySelectorAll('.nav-btn').forEach((btn, i) => {
        btn.classList.toggle('current', i === currentQuestion);
    });
}

function previousQuestion() {
    if (currentQuestion > 0) {
        jumpToQuestion(currentQuestion - 1);
    }
}

function nextQuestion() {
    if (currentQuestion < quizData.length - 1) {
        jumpToQuestion(currentQuestion + 1);
    }
}

function updateProgress() {
    const progress = (currentQuestion + 1) / quizData.length * 100;
    document.getElementById('progress').style.width = `${progress}%`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = 
            `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) submitQuiz();
    }, 1000);
}

async function submitQuiz() {
    const participantName = document.getElementById('participant-name').value;
    clearInterval(timerInterval);
    
    // Calculate score first
    let score = 0;
    const results = quizData.map((q, index) => {
        const correctAnswer = q.answer.toLowerCase().trim();
        const selectedAnswer = userAnswers[index]?.toLowerCase().trim();
        const isCorrect = selectedAnswer === correctAnswer;
        
        if (isCorrect) score++;
        return {
            question: q.question,
            selected: userAnswers[index] || 'Not answered',
            correct: q.answer,
            isCorrect
        };
    });

    try {
        const { error } = await supabase
            .from('attempts')
            .insert([{
                quiz_id: currentQuizId,
                participant_name: participantName,
                score: score,
                attempted_at: new Date()
            }]);

        if (error) throw error;
    } catch (error) {
        console.error('Failed to save attempt:', error);
        alert('Error saving your attempt. Score might not be recorded.');
    }

    showResults(score, results);
}

function showResults(score, results) {
    document.getElementById('quiz-section').classList.add('hidden');
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('hidden');
    
    resultsSection.innerHTML = `
    <h2>📝 Quiz Results</h2>
    <div class="score-summary">
        <p>Final Score: <span class="highlight">${score}/${quizData.length}</span></p>
        <p>Percentage: <span class="highlight">${((score/quizData.length)*100).toFixed(1)}%</span></p>
        <p>Time Remaining: ${document.getElementById('time').textContent}</p>
        <p>Tab Switches: <span class="highlight">${tabSwitches}</span></p>
    </div>
    <div class="detailed-results">
        ${results.map((r, i) => `
            <div class="result-item ${r.isCorrect ? 'correct' : 'incorrect'}">
                <h4>❓ Question ${i + 1}: ${r.question}</h4>
                <p>✅ Correct Answer: ${r.correct.toUpperCase()}</p>
                <p>Your Answer: ${r.selected.toUpperCase()} 
                   ${r.isCorrect ? '✔️' : '❌'}</p>
            </div>
        `).join('')}
    </div>
    `;
}


async function uploadQuiz() {
    const quizId = document.getElementById('quiz-id').value;
    const quizTime = document.getElementById('quiz-time').value;
    const fileInput = document.getElementById('csvInput');
    const file = fileInput.files[0];
    const username = document.getElementById('quiz-username').value;
    const password = document.getElementById('quiz-password').value;

    if (!quizId || !quizTime || !file) {
        alert('Please fill all fields');
        return;
    }

    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const csvData = e.target.result;
        const questions = csvData.split('\n')
            .filter(row => row.trim())
            .map(row => {
                const cols = row.split(',');
                return {
                    question: cols[0],
                    options: [cols[1], cols[2], cols[3], cols[4]],
                    answer: cols[5].trim().toLowerCase()
                };
            });


        const passwordHash = btoa(password);
        const { data, error } = await supabase
            .from('quizzes')
            .insert([{
                quiz_id: quizId,
                questions: questions,
                time_limit: quizTime * 60,
                owner_username: username,
                owner_password: passwordHash,
                created_at: new Date()
            }]);

        if (error) {
            alert('Error saving quiz: ' + error.message);
        } else {
            alert('Quiz created successfully!');
            window.location.reload();
        }
    };
    reader.readAsText(file);
}


async function loadQuiz() {
    const quizId = document.getElementById('attempt-quiz-id').value;
    
    const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('quiz_id', quizId)
        .single();

    if (error) {
        alert('Quiz not found: ' + error.message);
        return;
    }

    currentQuizId = quizId;
    quizData = data.questions;
    timeLeft = data.time_limit;
    
    document.getElementById('attempt-quiz-section').classList.add('hidden');
    document.getElementById('quiz-section').classList.remove('hidden');
    document.getElementById('timer').classList.remove('hidden');
    
    initializeQuiz();
}









