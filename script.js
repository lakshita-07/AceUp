const revealItems = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

revealItems.forEach((item) => observer.observe(item));

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const uploadedFiles = document.getElementById('uploadedFiles');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getIcon(type) {
  if (type.includes('pdf')) return '📄';
  if (type.includes('image')) return '🖼️';
  if (type.includes('text') || type.includes('note')) return '📝';
  return '📎';
}

function addFiles(selectedFiles) {
  if (!uploadedFiles) return;

  Array.from(selectedFiles).forEach((file, index) => {
    const card = document.createElement('article');
    card.className = 'upload-card';

    const progress = document.createElement('div');
    progress.className = 'progress-track';
    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    progress.appendChild(fill);

    card.innerHTML = `
      <div class="upload-card-top">
        <div class="upload-meta">
          <div class="upload-icon">${getIcon(file.type)}</div>
          <div>
            <div class="upload-name">${file.name}</div>
            <div class="upload-type">${file.type || 'file'}</div>
          </div>
        </div>
        <span class="upload-size">${formatBytes(file.size)}</span>
      </div>
    `;

    card.appendChild(progress);

    const status = document.createElement('div');
    status.className = 'upload-state';
    status.textContent = 'Uploading…';
    card.appendChild(status);

    uploadedFiles.appendChild(card);

    let width = 0;
    const timer = setInterval(() => {
      width += 18;
      fill.style.width = Math.min(width, 100) + '%';
      if (width >= 100) {
        clearInterval(timer);
        status.textContent = 'Ready to process';
      }
    }, 140 + index * 30);
  });
}

if (dropzone && fileInput) {
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'dragend', 'drop'].forEach((eventName) => {
    dropzone.addEventListener(eventName, () => {
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  });

  fileInput.addEventListener('change', (event) => {
    addFiles(event.target.files);
    event.target.value = '';
  });
}

const quizQuestion = document.getElementById('quizQuestion');
const quizChoices = document.getElementById('quizChoices');
const quizProgress = document.getElementById('quizProgress');
const scoreBox = document.getElementById('scoreBox');
const submitQuiz = document.getElementById('submitQuiz');
const nextQuiz = document.getElementById('nextQuiz');

const quizData = [
  {
    question: 'Which resource type helps most with high-yield revision?',
    options: ['AI summaries', 'Random notes', 'Unrelated videos', 'Old social posts'],
    answer: 'AI summaries'
  },
  {
    question: 'What makes a topic more likely to appear in an exam?',
    options: ['Frequent PYQ patterns', 'Random formatting', 'Unreadable text', 'Outdated sources'],
    answer: 'Frequent PYQ patterns'
  },
  {
    question: 'Why is Hybrid Mode recommended?',
    options: ['It combines online and uploaded materials', 'It avoids studying', 'It removes all notes', 'It is only for experts'],
    answer: 'It combines online and uploaded materials'
  },
  {
    question: 'What does AceUp help students do?',
    options: ['Search less and learn more', 'Ignore resources', 'Avoid quizzes', 'Only memorize definitions'],
    answer: 'Search less and learn more'
  }
];

let currentQuiz = 0;
let score = 0;
let answered = false;

function renderQuiz() {
  if (!quizQuestion || !quizChoices || !quizProgress || !scoreBox) return;
  const item = quizData[currentQuiz];
  quizQuestion.textContent = item.question;
  quizChoices.innerHTML = '';
  item.options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quiz-option';
    button.textContent = option;
    button.addEventListener('click', () => {
      if (answered) return;
      document.querySelectorAll('.quiz-option').forEach((btn) => btn.classList.remove('selected'));
      button.classList.add('selected');
      button.dataset.selected = 'true';
    });
    quizChoices.appendChild(button);
  });
  quizProgress.style.width = `${((currentQuiz + 1) / quizData.length) * 100}%`;
  scoreBox.textContent = `Score: ${score} / ${quizData.length}`;
  answered = false;
}

if (submitQuiz && nextQuiz && quizQuestion) {
  submitQuiz.addEventListener('click', () => {
    if (answered) return;
    const selected = document.querySelector('.quiz-option.selected');
    if (!selected) return;
    answered = true;
    const correct = selected.textContent === quizData[currentQuiz].answer;
    if (correct) score += 1;
    document.querySelectorAll('.quiz-option').forEach((option) => {
      option.classList.add(option.textContent === quizData[currentQuiz].answer ? 'correct' : 'wrong');
      option.classList.remove('selected');
    });
    if (selected.textContent !== quizData[currentQuiz].answer) {
      selected.classList.add('wrong');
    }
    scoreBox.textContent = `Score: ${score} / ${quizData.length}`;
  });

  nextQuiz.addEventListener('click', () => {
    currentQuiz = (currentQuiz + 1) % quizData.length;
    renderQuiz();
  });

  renderQuiz();
}

const flashcard = document.getElementById('flashcard');
const flipBtn = document.getElementById('flipBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const flashQuestion = document.getElementById('flashQuestion');
const flashAnswer = document.getElementById('flashAnswer');
const flashStatus = document.getElementById('flashStatus');
const flashProgress = document.getElementById('flashProgress');

const cards = [
  { question: 'What is the main goal of active recall?', answer: 'To strengthen memory by recalling information without looking at notes.' },
  { question: 'Why are PYQs useful for revision?', answer: 'They reveal repeated concepts, question patterns, and expected difficulty.' },
  { question: 'What makes a topic high-weightage?', answer: 'It frequently appears in papers and covers core concepts in the syllabus.' },
  { question: 'How does AceUp help students?', answer: 'It organizes resources, summaries, flashcards, quizzes, and key revision notes in one place.' }
];

let currentIndex = 0;

function renderCard() {
  if (!flashcard || !flashQuestion || !flashAnswer || !flashStatus || !flashProgress) return;
  flashcard.classList.remove('flipped');
  flashQuestion.textContent = cards[currentIndex].question;
  flashAnswer.textContent = cards[currentIndex].answer;
  flashStatus.textContent = `Card ${currentIndex + 1} of ${cards.length}`;
  flashProgress.style.width = `${((currentIndex + 1) / cards.length) * 100}%`;
}

if (flashcard && flipBtn && prevBtn && nextBtn) {
  flipBtn.addEventListener('click', () => flashcard.classList.toggle('flipped'));
  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    renderCard();
  });
  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % cards.length;
    renderCard();
  });
  renderCard();
}
