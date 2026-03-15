const beginnerQuizData = [
  { question: "What should you do before clicking a link in an unknown email?", options: ["Click right away", "Delete or verify sender", "Forward to a friend", "Reply with details"], answer: 1, explanation: "Verify unknown senders; phishing links can steal passwords." },
  { question: "Which is the safest password practice?", options: ["Same password everywhere", "Password manager + MFA", "Short numeric pass", "Write on paper"], answer: 1, explanation: "Password manager and MFA are the safest." },
  { question: "What does HTTPS in a website URL mean?", options: ["Encrypted connection", "Faster speed", "No ads", "Government site"], answer: 0, explanation: "HTTPS encrypts data between site and browser." },
  { question: "What should you avoid on public Wi-Fi?", options: ["Reading news", "Using plain email", "Banking without VPN", "Watching videos"], answer: 2, explanation: "Do sensitive actions only on secure networks." }
];

const hackerQuizData = [
  { question: "A server returns 403 for admin endpoint. What should you do?", options: ["Try random inputs", "Report to security team", "Ignore it", "Use SQL injection"], answer: 1, explanation: "Reporting is responsible; do not exploit unknown systems." },
  { question: "Which is a strong defense against brute-force login attacks?", options: ["No lockout", "CAPTCHA + rate limit", "Weak password", "No authentication"], answer: 1, explanation: "Rate limiting and CAPTCHA slow attackers." },
  { question: "What does 'least privilege' mean?", options: ["No restrictions", "Only necessary permissions", "Admin access for all", "Password complexity"], answer: 1, explanation: "Users get only permissions they need." },
  { question: "In threat modeling, what's the first step?", options: ["Ignore risk", "Identify assets and threats", "Write random code", "Disable audit logs"], answer: 1, explanation: "You must identify assets and threats first." }
];

let currentQuestion = 0;
let score = 0;

function getQuizData() {
  const mode = localStorage.getItem("cybersafeMode") || "beginner";
  return mode === "hacker" ? hackerQuizData : beginnerQuizData;
}

function isHackerUnlocked() {
  return true;
}

function updateModeSelectUI() {
  const hackerBtn = document.getElementById("hacker-btn");
  const unlockLabel = document.getElementById("hacker-unlock-label");
  const unlocked = true;
  if (hackerBtn) hackerBtn.disabled = false;
  if (unlockLabel) {
    unlockLabel.textContent = "Hacker Mode Unlocked 🎉";
    unlockLabel.className = "unlock-label unlocked";
  }
}

function toggleMode() {
  const mode = localStorage.getItem("cybersafeMode") || "beginner";
  setMode(mode === "hacker" ? "beginner" : "hacker");
}

function setMode(mode) {
  localStorage.setItem("cybersafeMode", mode);
  renderModeHeader();
  updateModeSelectUI();
  if (mode === "hacker") {
    if (!window.location.pathname.toLowerCase().includes("hacker.html")) {
      window.location.href = "hacker.html";
    } else {
      window.location.reload();
    }
    return;
  }

  if (!window.location.pathname.toLowerCase().includes("index.html") && !window.location.pathname.toLowerCase().endsWith("/")) {
    window.location.href = "index.html";
    return;
  }

  const modeScreen = document.getElementById("mode-screen");
  const beginnerHome = document.getElementById("beginner-home");
  if (modeScreen && beginnerHome) {
    modeScreen.style.display = "none";
    beginnerHome.style.display = "block";
  }
  const tipsBottom = document.getElementById("tips-bottom");
  if (tipsBottom) {
    tipsBottom.style.display = "block";
  }
  updateHomeStats();
}

function setBodyModeClass(mode) {
  document.body.classList.remove("beginner-mode", "hacker-mode");
  document.body.classList.add(`${mode}-mode`);
}

function renderModeHeader() {
  const mode = localStorage.getItem("cybersafeMode") || "beginner";
  setBodyModeClass(mode);
  const modePill = document.getElementById("mode-pill");
  const homeLink = document.getElementById("home-link");
  const navBrand = document.querySelector(".nav-brand");
  if (modePill) {
    modePill.textContent = mode === "hacker" ? "Mode: Hacker" : "Mode: Beginner";
    modePill.className = `mode-pill ${mode}`;
  }
  if (homeLink) {
    homeLink.href = mode === "hacker" ? "hacker.html" : "index.html";
  }
  if (navBrand) {
    navBrand.textContent = mode === "hacker" ? "CyberSafe Teens - Hacker Mode" : "CyberSafe Teens";
  }
}

function ensureModePageIsValid() {
  return true;
}

function markBeginnerComplete() {
  localStorage.setItem("beginnerComplete", "true");
}

function isBeginnerComplete() {
  return localStorage.getItem("beginnerComplete") === "true";
}

function getPhishingStats() {
  const correct = Number(localStorage.getItem("phishingCorrect") || "0");
  const total = Number(localStorage.getItem("phishingTotal") || "0");
  return { correct, total };
}

function savePhishingStats(correct, total) {
  localStorage.setItem("phishingCorrect", String(correct));
  localStorage.setItem("phishingTotal", String(total));
}

function updatePhishingBadge() {
  const badge = document.getElementById("phishing-badge");
  if (!badge) return;
  const { correct, total } = getPhishingStats();
  const ratio = total > 0 ? Math.round((correct / total) * 100) : 0;
  if (ratio >= 80 && total > 0) {
    badge.textContent = `🛡️ Phishing Shield Badge: ${ratio}% accuracy`;
    badge.className = "badge badge-good";
  } else if (total > 0) {
    badge.textContent = `🔍 Phishing Apprentice: ${ratio}% accuracy`;
    badge.className = "badge badge-medium";
  } else {
    badge.textContent = "🔔 Take a phishing scenario to earn a badge";
    badge.className = "badge";
  }
}

function loadQuestion() {
  const questionNumberEl = document.getElementById("question-number");
  const questionTextEl = document.getElementById("question-text");
  const answerButtonsEl = document.getElementById("answer-buttons");
  const feedbackEl = document.getElementById("feedback");
  const nextBtn = document.getElementById("next-btn");
  const progressText = document.getElementById("progress-text");
  const progressFill = document.getElementById("progress-fill");

  if (!questionTextEl || !answerButtonsEl || !feedbackEl || !nextBtn) return;

  const qData = getQuizData();
  const q = qData[currentQuestion];
  questionNumberEl.textContent = `Question ${currentQuestion + 1} of ${qData.length}`;
  questionTextEl.textContent = q.question;
  progressText.textContent = `Question ${currentQuestion + 1} / ${qData.length}`;
  progressFill.style.width = `${((currentQuestion) / qData.length) * 100}%`;
  answerButtonsEl.innerHTML = "";
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtn.disabled = true;

  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = option;
    button.onclick = () => selectAnswer(index);
    answerButtonsEl.appendChild(button);
  });
}

function selectAnswer(index) {
  const qData = getQuizData();
  const q = qData[currentQuestion];
  const buttons = document.querySelectorAll(".answer-btn");
  const feedbackEl = document.getElementById("feedback");
  const nextBtn = document.getElementById("next-btn");

  buttons.forEach((button, btnIndex) => {
    button.disabled = true;
    if (btnIndex === q.answer) button.classList.add("correct");
    if (btnIndex === index && index !== q.answer) button.classList.add("wrong");
  });

  if (index === q.answer) {
    score += 1;
    feedbackEl.textContent = `Correct! ${q.explanation}`;
    feedbackEl.classList.add("correct");
  } else {
    feedbackEl.textContent = `Wrong. ${q.explanation}`;
    feedbackEl.classList.add("wrong");
  }

  nextBtn.disabled = false;
}

function nextQuestion() {
  const qData = getQuizData();
  currentQuestion += 1;
  if (currentQuestion >= qData.length) {
    showResult();
    return;
  }
  loadQuestion();
}

function getLeaderboard() {
  let board = [];
  try {
    board = JSON.parse(localStorage.getItem("cybersafeLeaderboard") || "[]");
  } catch {
    board = [];
  }
  return Array.isArray(board) ? board : [];
}

function saveLeaderboard(board) {
  try { localStorage.setItem("cybersafeLeaderboard", JSON.stringify(board)); } catch {}
}

function addResultToLeaderboard(score) {
  const qData = getQuizData();
  const board = getLeaderboard();
  const percent = Math.round((score / qData.length) * 100);
  board.push({ score, percentage: percent, time: new Date().toISOString() });
  board.sort((a,b) => b.score - a.score || b.percentage - a.percentage);
  saveLeaderboard(board.slice(0, 6));
}

function resetScoreboard() {
  localStorage.removeItem("cybersafeLeaderboard");
  localStorage.removeItem("phishingCorrect");
  localStorage.removeItem("phishingTotal");
  updateHomeStats();
  updatePhishingBadge();
  updateScoreDashboard();
  if (document.getElementById("breakdown-list")) {
    const bd = document.getElementById("breakdown-list");
    bd.innerHTML = "<div>Quiz best: 0%</div><div>Phishing detection: 0% (0 attempts)</div><div>Overall: 0%</div>";
  }
}

function getScoreData() {
  const qData = getQuizData();
  const leaderboard = getLeaderboard();
  const best = leaderboard.length ? leaderboard[0].percentage : 0;
  const { correct, total } = getPhishingStats();
  const phishRate = total ? Math.round((correct / total) * 100) : 0;
  return { quizBest: best, phishRate, totalPhish: total };
}

function updateScoreDashboard() {
  const scoreNumber = document.getElementById("score-number");
  const scoreFill = document.getElementById("score-fill");
  const riskLevel = document.getElementById("risk-level");
  const badgeBox = document.getElementById("badge-box");
  const breakdownList = document.getElementById("breakdown-list");
  if (!scoreNumber || !scoreFill || !riskLevel || !badgeBox || !breakdownList) return;

  const { quizBest, phishRate, totalPhish } = getScoreData();
  const overall = Math.round((quizBest + phishRate) / 2);
  scoreNumber.textContent = `${overall}%`;
  scoreFill.style.width = `${overall}%`;
  let risk = "Unknown";
  if (overall >= 80) risk = "Low";
  else if (overall >= 50) risk = "Medium";
  else risk = "High";
  riskLevel.textContent = `Risk: ${risk}`;

  badgeBox.innerHTML = "";
  if (overall >= 85) badgeBox.textContent = "🏆 Cyber Guardian";
  else if (overall >= 65) badgeBox.textContent = "🔰 Security Starter";
  else badgeBox.textContent = "⚠️ Keep Training";

  breakdownList.innerHTML = `
    <div>Quiz best: ${quizBest}%</div>
    <div>Phishing detection: ${phishRate}% (${totalPhish} attempts)</div>
    <div>Overall: ${overall}%</div>
  `;
}

function formatLeaderboardHtml() {
  const qData = getQuizData();
  const board = getLeaderboard();
  if (!board.length) return "<p>No entries yet. Finish a quiz to save your score.</p>";
  return `
    <div class='leaderboard-list'>
      ${board.map((entry, idx) => `<div class='leaderboard-row'><strong>#${idx + 1}</strong> ${entry.score}/${qData.length} (${entry.percentage}%)</div>`).join("")}
    </div>
  `;
}

function showResult() {
  const qData = getQuizData();
  const quizCard = document.querySelector(".quiz-card");
  if (!quizCard) return;

  addResultToLeaderboard(score);
  const percentage = Math.round((score / qData.length) * 100);
  const message = percentage >= 80 ? "Excellent! You're cyber-savvy." : percentage >= 50 ? "Good effort, keep practicing." : "Great start—try again to improve.";

  if (localStorage.getItem("cybersafeMode") !== "hacker") {
    markBeginnerComplete();
    renderModeHeader();
    updateModeSelectUI();
  }

  quizCard.innerHTML = `
    <h1>Quiz Complete</h1>
    <p>You scored <strong>${score} / ${qData.length}</strong> (${percentage}%).</p>
    <p>${message}</p>
    <div class='button-row'><a class='primary-btn' href='quiz.html'>Retake Quiz</a><a class='secondary-btn' href='tips.html'>View Cyber Tips</a></div>
    <div class='leaderboard-container'><h3>Leaderboard</h3>${formatLeaderboardHtml()}</div>
  `;
  updateHomeStats();
  renderModeHeader();
}

function updateHomeStats() {
  const best = document.getElementById("home-best-score");
  const attempts = document.getElementById("home-attempts");
  const board = getLeaderboard();
  const qData = getQuizData();
  if (best) {
    if (!board.length) best.textContent = "Best Score: -";
    else {
      const top = board[0];
      best.textContent = `Best Score: ${top.score}/${qData.length} (${top.percentage}%)`;
    }
  }
  if (attempts) {
    attempts.textContent = `Quiz attempts: ${board.length}`;
  }
}

function resetQuizPage() {
  const questionTextEl = document.getElementById("question-text");
  if (!questionTextEl) return;
  currentQuestion = 0;
  score = 0;
  loadQuestion();
}

function resetPasswordPage() {
  const input = document.getElementById("password-input");
  if (input) {
    input.value = "";
    passwordBuilder = "";
  }
  updatePasswordStrength();
}

function resetPhishingPage() {
  const emailFrom = document.getElementById("email-from");
  if (!emailFrom) return;
  phishingIndex = 0;
  phishingCorrect = 0;
  phishingTotal = 0;
  savePhishingStats(0, 0);
  renderPhishingScenario();
  updatePhishingBadge();
}

function resetCurrentPageState() {
  resetQuizPage();
  resetPasswordPage();
  resetPhishingPage();
}

function updatePasswordStrength() {
  const input = document.getElementById("password-input");
  const display = document.getElementById("password-feedback");
  const strengthText = document.getElementById("strength-text");
  const displayCode = document.getElementById("password-display");
  const strengthBar = document.getElementById("strength-bar");
  const items = {
    length: document.getElementById("check-length"),
    upper: document.getElementById("check-upper"),
    number: document.getElementById("check-number"),
    symbol: document.getElementById("check-symbol")
  };
  if (!input || !displayCode || !strengthBar) return;

  const pwd = input.value;
  displayCode.textContent = pwd || "(empty)";

  const hasLength = pwd.length >= 10;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);

  if (items.length) items.length.className = `check-item ${hasLength ? "valid" : ""}`;
  if (items.upper) items.upper.className = `check-item ${(hasUpper && hasLower) ? "valid" : ""}`;
  if (items.number) items.number.className = `check-item ${hasNumber ? "valid" : ""}`;
  if (items.symbol) items.symbol.className = `check-item ${hasSymbol ? "valid" : ""}`;

  const score = [hasLength, hasUpper && hasLower, hasNumber, hasSymbol].filter(Boolean).length;
  const ratio = (score / 4) * 100;
  strengthBar.style.width = `${ratio}%`;

  const strengthLabel = score === 4 ? "Strong" : score >= 2 ? "Medium" : "Weak";
  if (strengthText) {
    strengthText.textContent = `Strength: ${strengthLabel}`;
  }

  if (display) {
    display.className = "password-feedback";
    display.classList.remove("password-weak", "password-medium", "password-strong");
    if (!pwd) {
      display.textContent = "Type or build a password to see strength.";
      return;
    }
    if (score === 4) {
      display.textContent = "Strong password. Great job!";
      display.classList.add("password-strong");
    } else if (score >= 2) {
      display.textContent = "Medium password. Add more length and symbols.";
      display.classList.add("password-medium");
    } else {
      display.textContent = "Weak password. Add length, capitals, numbers, and symbols.";
      display.classList.add("password-weak");
    }
  }
}

let passwordBuilder = "";
function addChars(chars) {
  const input = document.getElementById("password-input");
  if (!input) return;
  passwordBuilder = input.value + chars;
  input.value = passwordBuilder;
  updatePasswordStrength();
}

function increaseLength() {
  const input = document.getElementById("password-input");
  if (!input) return;
  input.value = input.value + "xy9$";
  updatePasswordStrength();
}

function resetPassword() {
  const input = document.getElementById("password-input");
  if (!input) return;
  input.value = "";
  updatePasswordStrength();
}

const beginnerPhishingScenarios = [
  { level: 1, from: "support@unibank.com", subject: "URGENT: Verify your account now!", body: "Your account will be locked in 10 minutes. Click http://unibank-login-secure.com and enter your details.", phishing: true, clue: "Urgent tone + suspicious URL + unknown sender.", humor: "Even your grandma could spot this scam.", highlights: ["http://unibank-login-secure.com", "locked in 10 minutes"] },
  { level: 1, from: "noreply@freecoupon.com", subject: "You won a free iPhone!", body: "Claim your prize now by entering your card at http://free-iphone-claim.com.", phishing: true, clue: "Too good to be true + random domain.", humor: "Hacker Mike says: not even close.", highlights: ["http://free-iphone-claim.com"] },
  { level: 2, from: "it-support@school.edu", subject: "Password reset request", body: "Please reset your password at https://school.edu/reset.", phishing: false, clue: "Correct domain and normal tone.", humor: "This one is safe if the domain is real.", highlights: [] }
];

const hackerPhishingScenarios = [
  { level: 2, from: "security@bank.com", subject: "Important: Confirm your transaction", body: "A $982 transfer is pending. Confirm now at https://bank.com/login.", phishing: true, clue: "Must verify domain and check transaction details.", humor: "This one is sneakier than your sleep schedule.", highlights: ["https://bank.com/login"] },
  { level: 3, from: "noc@corp-infra.com", subject: "Critical security update required", body: "Download the new security patch from http://corp-infra.com/update.", phishing: true, clue: "Using HTTP and uncommon domain is suspicious.", humor: "Hacker Mike loves fake infrastructure emails.", highlights: ["http://corp-infra.com/update"] },
  { level: 3, from: "admin@collabspace.com", subject: "Your shared doc has a comment", body: "Check your comment at https://collabspace.com/document/12345.", phishing: false, clue: "Trusted domain and familiar pattern.", humor: "This one is likely real if you use the service.", highlights: [] },
  { level: 3, from: "service@paymentsecure.com", subject: "Invoice overdue", body: "Pay your outstanding invoice at https://paymentsecure.com/pay.", phishing: true, clue: "Suspicious domain and urgency.", humor: "Real vendors rarely threaten you with immediate lockout.", highlights: ["https://paymentsecure.com/pay"] }
];

let phishingIndex = 0;
let phishingCorrect = Number(localStorage.getItem("phishingCorrect") || "0");
let phishingTotal = Number(localStorage.getItem("phishingTotal") || "0");

function getPhishingScenarios() {
  return (localStorage.getItem("cybersafeMode") || "beginner") === "hacker" ? hackerPhishingScenarios : beginnerPhishingScenarios;
}

function renderPhishingScenario() {
  const scenarios = getPhishingScenarios();
  const scenario = scenarios[phishingIndex % scenarios.length];
  if (!scenario) return;
  const fromEl = document.getElementById("email-from");
  const subjectEl = document.getElementById("email-subject");
  const bodyEl = document.getElementById("email-body");
  const levelEl = document.getElementById("scenario-level");
  const progressText = document.getElementById("phishing-progress-text");
  const progressFill = document.getElementById("phishing-progress-fill");
  const hackerMike = document.getElementById("hacker-mike");

  if (fromEl) fromEl.textContent = `From: ${scenario.from}`;
  if (subjectEl) subjectEl.textContent = `Subject: ${scenario.subject}`;
  if (bodyEl) bodyEl.textContent = scenario.body;
  if (levelEl) levelEl.textContent = `Level ${scenario.level}`;
  const scenarioList = getPhishingScenarios();
  if (progressText) progressText.textContent = `${phishingCorrect}/${scenarioList.length} threats detected`;
  if (progressFill) progressFill.style.width = `${(phishingCorrect / scenarioList.length) * 100}%`;
  if (hackerMike) hackerMike.textContent = "Hacker Mike is watching your choices...";

  const feedback = document.getElementById("phishing-feedback");
  const details = document.getElementById("phishing-details");
  if (feedback) {
    feedback.textContent = "Choose Safe or Phishing";
    feedback.className = "feedback";
  }
  if (details) {
    details.textContent = "";
  }
  const card = document.getElementById("phishing-scenario");
  if (card) {
    card.classList.remove("phishing-highlight");
    card.classList.remove("safe-highlight");
  }
}

function submitPhishing(answerIsPhishing) {
  const scenarios = getPhishingScenarios();
  const scenario = scenarios[phishingIndex % scenarios.length];
  const feedback = document.getElementById("phishing-feedback");
  const details = document.getElementById("phishing-details");
  const card = document.getElementById("phishing-scenario");
  if (!scenario || !feedback || !details || !card) return;

  const correct = answerIsPhishing === scenario.phishing;
  phishingTotal += 1;
  if (correct) phishingCorrect += 1;

  const humor = scenario.humor || "Nice choice.";
  const explanation = scenario.phishing
    ? `This was phishing because of: ${scenario.clue}`
    : `This was safe. ${scenario.clue}`;

  if (!correct && answerIsPhishing === false && scenario.phishing) {
    document.body.classList.add("flash-red");
    setTimeout(() => document.body.classList.remove("flash-red"), 320);
    feedback.textContent = "Access granted to hacker… Just kidding. But this is how attacks begin.";
    feedback.className = "feedback wrong";
  } else {
    feedback.textContent = correct ? `Correct! ${humor}` : `Not quite. ${humor}`;
    feedback.className = `feedback ${correct ? "correct" : "wrong"}`;
  }

  details.textContent = explanation;
  card.classList.toggle("phishing-highlight", scenario.phishing);
  card.classList.toggle("safe-highlight", !scenario.phishing);

  savePhishingStats(phishingCorrect, phishingTotal);
  updatePhishingBadge();

  const scenarioList = getPhishingScenarios();
  if (phishingCorrect === scenarioList.length && scenarioList.length > 0) {
    setTimeout(() => {
      alert("🎉 Professional Hacker Destroyer badge earned! You detected all attacks.");
    }, 120);
  }
}

function nextPhishingScenario() {
  const scenarios = getPhishingScenarios();
  phishingIndex = (phishingIndex + 1) % scenarios.length;
  renderPhishingScenario();
}


window.addEventListener("DOMContentLoaded", () => {
  renderModeHeader();
  updateModeSelectUI();
  if (!ensureModePageIsValid()) return;

  const mode = localStorage.getItem("cybersafeMode");
  const modeScreen = document.getElementById("mode-screen");
  const beginnerHome = document.getElementById("beginner-home");
  if (modeScreen && beginnerHome) {
    if (mode === "beginner") {
      modeScreen.style.display = "none";
      beginnerHome.style.display = "block";
      updateHomeStats();
    } else if (mode === "hacker") {
      window.location.href = "hacker.html";
    } else {
      modeScreen.style.display = "block";
      beginnerHome.style.display = "none";
    }
  }

  if (document.getElementById("question-text")) {
    resetQuizPage();
  }

  if (document.getElementById("password-input")) {
    resetPasswordPage();
  }

  if (document.getElementById("email-from")) {
    resetPhishingPage();
  }

  if (document.getElementById("home-best-score")) {
    updateHomeStats();
  }
  if (document.getElementById("score-number")) {
    updateScoreDashboard();
  }

  updatePhishingBadge();

  const pwInput = document.getElementById("password-input");
  if (pwInput) {
    pwInput.addEventListener("input", updatePasswordStrength);
  }

  window.addEventListener("pageshow", () => {
    if (document.getElementById("question-text")) {
      resetQuizPage();
    }
    if (document.getElementById("password-input")) {
      resetPasswordPage();
    }
    if (document.getElementById("email-from")) {
      resetPhishingPage();
    }
  });
});
