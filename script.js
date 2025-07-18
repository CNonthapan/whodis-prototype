console.log("script.js loaded successfully.");

// --- Prototype State and Data ---
const state = {
    currentPage: 'welcome-page',
    questionnaireScore: 0,
    puzzlesScore: 0,
    aiScore: 0,
    currentQuestionIndex: 0,
    questions: [
        { text: "Have you recently experienced memory lapses or forgetting appointments?", score: 3 },
        { text: "Do you have difficulty managing finances or planning daily tasks?", score: 3 },
        { text: "Have you noticed changes in your mood or social withdrawal?", score: 2 }
    ],
    puzzleWords: ["Apple", "River", "House", "Chair", "Road"],
    puzzleCompleted: false,
    aiCompleted: false
};

// --- DOM Elements ---
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const questionText = document.getElementById('question-text');
const answerButtons = document.querySelectorAll('.answer-button');
const questionStatus = document.getElementById('question-status');
const puzzleInstructions = document.getElementById('puzzle-instructions');
const wordList = document.getElementById('word-list');
const userWordsInput = document.getElementById('user-words');
const submitWordsButton = document.getElementById('submit-words');

// New chatbot elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

const resultText = document.getElementById('result-text');
const recommendationsText = document.getElementById('recommendations-text');

// --- Helper Functions ---
function showPage(pageId) {
    pages.forEach(page => page.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    state.currentPage = pageId;
}

function calculateRiskLevel() {
    const totalScore = state.questionnaireScore + state.puzzlesScore + state.aiScore;
    if (totalScore > 15) {
        return "High Risk";
    } else if (totalScore > 8) {
        return "Medium Risk";
    } else {
        return "Low Risk";
    }
}

// --- Assessment Sections ---
function displayNextQuestion() {
    if (state.currentQuestionIndex < state.questions.length) {
        questionText.textContent = state.questions[state.currentQuestionIndex].text;
        questionStatus.textContent = `Question ${state.currentQuestionIndex + 1} of ${state.questions.length}`;
    } else {
        questionText.textContent = "Questionnaire complete!";
        questionStatus.textContent = "You can now navigate to another section.";
    }
}

function startPuzzles() {
    if (!state.puzzleCompleted) {
        puzzleInstructions.textContent = "Memorize the words below. You have 10 seconds.";
        userWordsInput.style.display = 'none';
        submitWordsButton.style.display = 'none';
        wordList.textContent = state.puzzleWords.join(', ');
        
        setTimeout(() => {
            puzzleInstructions.textContent = "Time's up! Now type the words you remember.";
            wordList.textContent = "Start typing...";
            userWordsInput.style.display = 'block';
            submitWordsButton.style.display = 'block';
            userWordsInput.focus();
        }, 10000);
    } else {
        puzzleInstructions.textContent = "Puzzles completed. Navigate to another section.";
        wordList.textContent = "";
        userWordsInput.style.display = 'none';
        submitWordsButton.style.display = 'none';
    }
}

// Helper functions for the chatbot
function addMessage(sender, message) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    
    const messageElement = document.createElement('p');
    messageElement.className = `${sender}-message`;
    messageElement.textContent = message;
    
    messageContainer.appendChild(messageElement);
    chatBox.appendChild(messageContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// This function replaces the old, simulated sendToAPI function
function sendToAPI(message) {
    addMessage('ai', 'Thinking...');
    
    // Make a real fetch request to your backend server
    fetch('http://127.0.0.1:5000/api/chatbot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => {
        // Check if the response was successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Remove the "Thinking..." message
        const thinkingMessage = document.querySelector('.ai-message:last-child');
        if (thinkingMessage && thinkingMessage.textContent === 'Thinking...') {
            thinkingMessage.remove();
        }

        // Add the real AI response and update the score
        addMessage('ai', data.response);
        state.aiScore = data.score;
    })
    .catch(error => {
        // Handle any errors that occur
        console.error('Error connecting to the server:', error);
        addMessage('ai', 'Error: Could not connect to the server.');
    });
}

// --- Event Listeners ---
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = e.target.dataset.page;
        showPage(pageId);

        if (pageId === 'questionnaire-page') {
            displayNextQuestion();
        } else if (pageId === 'puzzles-page') {
            startPuzzles();
        } else if (pageId === 'ai-page') {
            userInput.disabled = false;
            sendButton.disabled = false;
        } else if (pageId === 'results-page') {
            showResults();
        }
    });
});

answerButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const score = parseInt(e.target.dataset.score);
        state.questionnaireScore += score;
        state.currentQuestionIndex++;
        displayNextQuestion();
    });
});

submitWordsButton.addEventListener('click', () => {
    const userWords = userWordsInput.value.split(',').map(word => word.trim().toLowerCase());
    let correctCount = 0;
    state.puzzleWords.forEach(word => {
        if (userWords.includes(word.toLowerCase())) {
            correctCount++;
        }
    });
    state.puzzlesScore = (state.puzzleWords.length - correctCount) * 2;
    puzzleInstructions.textContent = "Puzzles completed. Navigate to another section.";
    wordList.textContent = "";
    state.puzzleCompleted = true;
});

sendButton.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (message !== '') {
        addMessage('user', message);
        userInput.value = '';
        sendToAPI(message);
    }
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});