// question must have its own radio group name
let questionIdCounter = 0; // question ID

const questionsEl = document.getElementById('questions');

// Detect "result mode"
const examResult = JSON.parse(localStorage.getItem("examResult"));

function readFileAsJSON(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch(e){
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsText(file);
  });
}

/***************************
Auto-grade: Exam results
***************************/
let examData = null;

// Auto-grade function (JSON-based, correct)
function gradeExamFromJSON(){
  let score = 0;
  let total = examData.questions.length;
  let details = [];

  examData.questions.forEach((q, index) => {
    const questionEl = document.querySelectorAll('.question')[index];

    // Correct answers from JSON
    const correctOptions = q.options
      .map((opt, i) => opt.checked ? i : null)
      .filter(i => i !== null);

    // User selected answers from UI
    const selectedOptions = [...questionEl.querySelectorAll('input:checked')]
      .map(input => Number(input.dataset.optionIndex));

    // Compare arrays (order-independent)
    const isCorrect =
      correctOptions.length === selectedOptions.length &&
      correctOptions.every(i => selectedOptions.includes(i));

    if (isCorrect) score++;

    details.push({
      question: q.text,
      correctOptions,
      selectedOptions,
      isCorrect,
      feedbackOk: q.feedbackOk || "",
      feedbackError: q.feedbackError || ""
    });
  });

  return {
    title: examData.title,
    score,
    scoreMin: examData.settings.general.scoreMin,
    total,
    percentage: Math.round((score / total) * 100),
    details
  };
}

/***************************
Header
***************************/
// Add total points calculation
function updateTotalPoints(){
  let total = 0;

  document.querySelectorAll('.points-input').forEach(input => {
    const val = parseFloat(input.value);
    if (!isNaN(val)) total += val;
  });

  document.getElementById('totalPoints').textContent =
    total % 1 === 0 ? total : total.toFixed(2);
}

/***************************
Questions
***************************/
document.addEventListener('input', e => {
  // Add question multiline
  if(e.target.classList.contains('q-title')||
    e.target.classList.contains('opt-text')){
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  }

  updateJSON();
});

// Toggleable radios
document.addEventListener('click', e => {
  const radio = e.target;

  if (!radio.classList.contains('opt-icon')) return;

  if (radio.type !== 'radio') return;

  // if it was already checked, uncheck it
  if (radio.dataset.wasChecked === 'true') {
    radio.checked = false;
    radio.dataset.wasChecked = 'false';
  } else {
    // uncheck other radios in same group
    document
      .querySelectorAll(`input[type="radio"][name="${radio.name}"]`)
      .forEach(r => r.dataset.wasChecked = 'false');

    radio.dataset.wasChecked = 'true';
  }

  updateJSON();
});

function addQuestion(){
  const q = document.createElement('div');
  q.className = 'card question';
  q.dataset.qid = 'q_' + (++questionIdCounter); // ID question

  q.innerHTML = `
    <div class="drag">: : :</div>

    <div class="question-header">

      <div class="q-counter" style="
        font-size:13px;
        color:#5f6368;
        margin-right:auto;
      ">
        1 de 1
      </div>

      <button class="btn-link g-tooltip delete-top"
        data-tooltip="Delete question"
        onclick="removeQuestion(this)">
      <i class="fa fa-trash"></i></button>

      <!--
      <button class="btn-link g-tooltip delete-top"
        data-tooltip="Delete question"
        onclick="removeQuestion(this)">
        🗑️
      </button>-->
      
      <div class="q-points">
        <input type="number"
          class="points-input"
          min="0"
          step="0.01"
          placeholder="0"
          oninput="limitDecimals(this); updateJSON()" />
        <span>points</span>
      </div>
    </div>

    <textarea class="q-title" placeholder="Question" rows="1" readonly></textarea>

    <select class="q-type" onchange="updateOptions(this)">
      <option value="radio">◉ One choice</option>
      <option value="checkbox">☑ Multiple choices</option>
    </select>

    <div class="options"></div>

    <div>
      <button class="btn-link" onclick="addOption(this)">Add option</button>
    </div>

    <div class="feedback" style="display:none">

      <div class="feedback-group ok">
        <div class="feedback-ok-label">
          <span class="feedback-icon">✔</span>
          <span>Feedback for correct answers:</span>
        </div>
        <textarea class="q-title q-comment-ok" rows="1" placeholder="Feedback"></textarea>
      </div>

      <div class="feedback-group error">
        <div class="feedback-error-label">
          <span class="feedback-icon">✖</span>
          <span>Feedback for incorrect answers:</span>
        </div>
        <textarea class="q-title q-comment-error" rows="1" placeholder="Feedback"></textarea>
      </div>

    </div>

    <div class="actions">
      <!--
      <button class="btn-link g-tooltip"
        data-tooltip="Duplicate"
        onclick="duplicateQuestion(this)">
        📄
      </button>-->

      <div class="required-toggle">
        <span>Required</span>
        <label class="switch">
          <input type="checkbox" class="q-required" onchange="updateJSON()">
          <span class="slider"></span>
        </label>
      </div>
    </div>
  `;

  questionsEl.appendChild(q);
  addOption(q.querySelector('.btn-link'));
  enableOptionDrag(q); // drag & drop per option
  updateJSON();
  updateQuestionCounters();
}

function duplicateQuestion(btn){
  const q = btn.closest('.question');
  const clone = q.cloneNode(true);

  // new question ID (important for radio groups)
  clone.dataset.qid = 'q_' + (++questionIdCounter);

  // fix radio group names
  clone.querySelectorAll('.opt-icon[type="radio"]').forEach(radio => {
    radio.name = clone.dataset.qid;
  });

  // remove active styles
  clone.classList.remove('active');

  // insert after original
  q.after(clone);

  // re-enable drag & drop for options
  enableOptionDrag(clone);

  updateJSON();
}

function removeQuestion(btn){
  btn.closest('.question').remove();
  updateJSON();
  updateSectionNumbers();
  updateQuestionCounters();
}

// points: enforce max 2 decimals
function limitDecimals(input){
  const value = input.value;
  if (!value.includes('.')) return;

  const [int, dec] = value.split('.');
  if (dec.length > 2){
    input.value = `${int}.${dec.slice(0,2)}`;
  }
}

// show {question-number} de {total-questions}
function updateQuestionCounters() {
  const questions = [...document.querySelectorAll('.question')];
  const total = questions.length;

  questions.forEach((q, index) => {
    let counter = q.querySelector('.q-counter');
    if (!counter) return;

    counter.textContent = `${index + 1} de ${total}`;
  });
}

function addOption(btn){
  const q = btn.closest('.question');
  const type = q.querySelector('.q-type').value;
  const options = q.querySelector('.options');
  const qid = q.dataset.qid; // ID question

  const opt = document.createElement('div');
  opt.className = 'option';

  opt.innerHTML = `
    <div class="opt-drag">⋮⋮</div>
    <input class="opt-icon" type="${type}" ${type === 'radio' ? `name="${qid}" data-was-checked="false"` : ''} />
    <textarea class="opt-text" rows="1" readonly></textarea>
    <button class="btn-link g-tooltip" data-tooltip="Remove"
      onclick="this.parentElement.remove(); updateJSON()">✕</button>
  `;
    // assign name to radio inputs when adding options

  const optionNumber = getNextOptionNumber(q);
  opt.querySelector('.opt-text').placeholder = `Option ${optionNumber}`; // option dynamic placeholder numbering

  options.appendChild(opt);

  // to map UI answers
  const optionIndex = options.querySelectorAll('.option').length - 1;
  opt.querySelector('.opt-icon').dataset.optionIndex = optionIndex;
    /* resulting HTML:
    <input type="radio" data-option-index="0">
    <input type="radio" data-option-index="1">
    */
  //

  enableOptionDrag(opt); // drag & drop per option

  updateJSON();
}

function updateOptions(select){
  const q = select.closest('.question');
  const type = select.value;
  const qid = q.dataset.qid; // ID question

  q.querySelectorAll('.opt-icon').forEach(icon => {
    icon.type = type;     // radio or checkbox
    icon.checked = false;

    if(type === 'radio'){
      icon.name = qid;
      icon.dataset.wasChecked = 'false'; // toggleable radios
    } else {
      icon.removeAttribute('name');
      delete icon.dataset.wasChecked; // toggleable radios
    }
  });

  updateJSON();
}

// Track option count per question
function getNextOptionNumber(q){
  return q.querySelectorAll('.opt-text').length + 1;
}

// enable drag & drop per options
function enableOptionDrag(q){
  const options = q.querySelector('.options');

  if(!options || options._sortable)
    return;

  // drag starts only from .opt-drag
  options._sortable = new Sortable(options, {
    handle: '.opt-drag',
    animation: 150,
    filter: '.opt-icon, .opt-text, button',
    preventOnFilter: false,
    onEnd: updateJSON
  });
}

// auto-resize textareas when import JSON file
function autoResizeTextarea(el){
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

/***************************
Navigation Buttons Next / Previous / Submit
***************************/
let oneByOneMode = false;
let currentQuestionIndex = 0;

function toggleQuestionView(toggle){
  oneByOneMode = toggle.checked;
  currentQuestionIndex = 0;

  if(oneByOneMode){
    showOnlyQuestion(currentQuestionIndex);
    document.getElementById('navCenter').style.display = 'block';
    document.getElementById('questionNav').style.display = 'block';
    updateNavButtons();
  }else{
    showAllQuestions();
    document.getElementById('navCenter').style.display = 'none';
    document.getElementById('questionNav').style.display = 'block';
  }

  updateSubmitVisibility();
}

function showOnlyQuestion(index){
  const questions = document.querySelectorAll('.question');

  questions.forEach((q, i) => {
    q.style.display = i === index ? 'block' : 'none';
    //q.classList.toggle('active', i === index);
  });
}

function showAllQuestions(){
  document.querySelectorAll('.question').forEach(q => {
    q.style.display = '';
    //q.classList.remove('active');
  });

  updateSubmitVisibility();
}

function nextQuestion(){
  const questions = document.querySelectorAll('.question');

  if(currentQuestionIndex < questions.length - 1){
    currentQuestionIndex++;
    showOnlyQuestion(currentQuestionIndex);
    updateNavButtons();
  }
}

function prevQuestion(){
  if(currentQuestionIndex > 0){
    currentQuestionIndex--;
    showOnlyQuestion(currentQuestionIndex);
    updateNavButtons();
  }
}

// control button states
function updateNavButtons() {
  const questions = document.querySelectorAll('.question');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');

  // Disable Previous on first question
  prevBtn.disabled = currentQuestionIndex === 0;

  // Disable Next on last question
  nextBtn.disabled = currentQuestionIndex === questions.length - 1;

  // Show Submit ONLY on last question
  submitBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'inline-block' : 'none';
}

function updateSubmitVisibility() {
  const submitBtn = document.getElementById('submitBtn');
  const questions = document.querySelectorAll('.question');

  if (!oneByOneMode) {
    // Show-all mode → always show Submit
    submitBtn.style.display = 'inline-block';

    document.getElementById('navCenter').style.display = 'none';
    document.getElementById('questionNav').style.display = 'block';

    return;
  }

  // One-by-one mode → only on last question
  submitBtn.style.display =
    currentQuestionIndex === questions.length - 1
      ? 'inline-block'
      : 'none';
}

// submit exam
// Protect manual Submit (no double submit)
let examSubmitted = false;

function submitExam(wasSubmited){
  if (examSubmitted) return;
  
  examSubmitted = true;

  clearInterval(timerInterval);

  if(!wasSubmited)
    alert("Exam submitted!");

  // collect answers here
  // redirect / show results / save to Firebase
  const result = gradeExamFromJSON();

  localStorage.setItem("examResult", JSON.stringify(result));

  window.location.href = "result.html";
}

// Auto-submit when the timer ends
// Auto-submits when time = 0
// Prevents double submit
function autoSubmitExam(){
  alert("⏱ Time is up! Exam submitted automatically.");

  submitExam(true);
}

/***************************
Proctor configuration
***************************/
function openProctorConfig(){
  document.getElementById('proctorModal').classList.remove('hidden');
}

function closeProctorConfig(){
  document.getElementById('proctorModal').classList.add('hidden');
}

function switchProctorTab(name){
  document.querySelectorAll('.proctor-tabs .tab')
    .forEach(t => t.classList.remove('active'));

  document.querySelectorAll('.tab-panel')
    .forEach(p => p.classList.remove('active'));

  document.querySelector(`[onclick="switchProctorTab('${name}')"]`)
    .classList.add('active');

  document.getElementById(`tab-${name}`)
    .classList.add('active');
}

// Timer
function toggleTimer(cb){
  const row = cb.closest('.tab-panel').querySelector('.timer-row');
  row.style.display = cb.checked ? 'flex' : 'none';
}

function fixSeconds(input){
  if (input.value > 59) input.value = 59;
  if (input.value < 0) input.value = 0;
}

function updateTimerJSON(){
  const panel = document.getElementById('tab-timer');
  const min = panel.querySelector('.timer-min')?.value || 0;
  const sec = panel.querySelector('.timer-sec')?.value || 0;

  const totalSeconds = (Number(min) * 60) + Number(sec);

  // save where you want (example)
  console.log('Timer (seconds):', totalSeconds);
}

/***************************
Save in JSON for database
***************************/
function updateJSON(){
  const form = {
    title: formTitle.value,
    description: formDesc.value,
    questions: []
  };

  document.querySelectorAll('.question').forEach(q => {

    // points in JSON
    const pointsInput = q.querySelector('.points-input');
    const points = parseFloat(pointsInput?.value) || 0;

    // build JSON
    form.questions.push({
      text: q.querySelector('.q-title').value,
      type: q.querySelector('.q-type').value,
      points: points,
      required: q.querySelector('.q-required')?.checked || false,
      options: [...q.querySelectorAll('.option')].map(opt => {
        const textInput = opt.querySelector('.opt-text');
        const control = opt.querySelector('.opt-icon');

        return {
          text: textInput.value || textInput.placeholder,
          checked: control.checked
        };
      }),
      feedbackOk: q.querySelector('.q-comment-ok')?.value || '',
      feedbackError: q.querySelector('.q-comment-error')?.value || ''
    });
  });

  form.settings = getProctorSettings();

  updateTotalPoints();
}

function isChecked(key){
  return document.querySelector(`[data-proctor="${key}"]`)?.checked || false;
}

function getProctorSettings(){
  const timerEnabled = isChecked('timer-enabled');

  const timerInputs = document.querySelectorAll('#tab-timer .timer-input');

  return {
    general: {
      viewToggleQuestions: isChecked('view-toggle-questions'),
      viewQuestions: isChecked('view-questions')
    },
    timer: {
      enabled: timerEnabled,
      minutes: timerEnabled ? Number(timerInputs[0]?.value || 0) : 0,
      seconds: timerEnabled ? Number(timerInputs[1]?.value || 0) : 0
    },
    camera: {
      enabled: isChecked('camera-enabled'),
      faceAbsence: isChecked('camera-face'),
      eyeTracking: isChecked('camera-eye')
    },
    noise: {
      enabled: isChecked('noise-enabled'),
      loudNoise: isChecked('noise-loud')
    },
    screen: {
      tabSwitch: isChecked('screen-tab'),
      fullscreenExit: isChecked('screen-fullscreen')
    }
  };
}

// import exam: load JSON into editor
function loadFormFromJSON(data){

  // clear existing
  questionsEl.innerHTML = '';
  questionIdCounter = 0;

  // header
  formTitle.value = data.title || '';
  formDesc.value = data.description || '';

  // questions
  data.questions?.forEach(qData => {
    addQuestion();

    const q = questionsEl.lastElementChild;

    // auto-resize for question
    const qTitle = q.querySelector('.q-title');
    qTitle.value = qData.text || '';
    autoResizeTextarea(qTitle);

    q.querySelector('.q-type').value = qData.type || 'radio';
    q.querySelector('.points-input').value = qData.points ?? 0;
    updateOptions(q.querySelector('.q-type'));

    // remove default option
    q.querySelector('.options').innerHTML = '';

    qData.options?.forEach(opt => {
      addOption(q.querySelector('.btn-link'));
      const lastOpt = q.querySelector('.options').lastElementChild;

      // auto-resize for options
      const optText = lastOpt.querySelector('.opt-text');
      optText.value = opt.text || '';
      lastOpt.querySelector('.opt-icon').checked = false; // option unchecked
      autoResizeTextarea(optText);

      // to map UI answers
      lastOpt.querySelector('.opt-icon').checked = !!opt.checked;
        /* resulting HTML:
        <input type="radio" data-option-index="0">
        <input type="radio" data-option-index="1">
        */
      //
    });

    // feedback
    if(examResult?.done) {
      //localStorage.removeItem("examResult");
          
      const feedbackBox = q.querySelector('.feedback');

      if (qData.feedbackOk || qData.feedbackError) {
        feedbackBox.style.display = 'block';
      }

      if(qData.feedbackOk){
        // auto-resize for feedback
        const feedbackOk = q.querySelector('.q-comment-ok');
        feedbackOk.value = qData.feedbackOk;
      }
      if(qData.feedbackError){
        // auto-resize for feedback
        const feedbackError = q.querySelector('.q-comment-error');
        feedbackError.value = qData.feedbackError;
      }
    }
  });

  // reset view mode after loading
  document.getElementById('oneByOneToggle').checked = false;
  oneByOneMode = false;
  showAllQuestions();
  //document.getElementById('questionNav').style.display = 'none';

  // Auto-resize ALL on load
  //q.querySelectorAll('textarea').forEach(autoResizeTextarea);
  
  updateJSON();
  updateQuestionCounters();
}

// Apply borders per question
// ✅ options the user selected correctly → green border
// ❌ options the user selected incorrectly → red border
function applyResultHighlighting() {
  if (!examResult || !examResult.details) return;

  document.body.classList.add("preview-mode");

  document.querySelectorAll(".question").forEach((qEl, qIndex) => {
    const detail = examResult.details[qIndex];
    if (!detail) return;

    // Tag each question as correct / incorrect
    qEl.dataset.result = detail.isCorrect ? "correct" : "incorrect";

    /* ------------------
       OPTION HIGHLIGHTING
    ------------------- */
    const options = qEl.querySelectorAll(".option");

    options.forEach((optEl, optIndex) => {
      if (!detail.selectedOptions.includes(optIndex)) return;

      const icon = document.createElement("span");
      icon.className = "option-result-icon";

      if (detail.correctOptions.includes(optIndex)) {
        optEl.classList.add("correct");
        icon.textContent = "✔";
      } else {
        optEl.classList.add("incorrect");
        icon.textContent = "✖";
      }

      optEl.appendChild(icon);
    });

    /* ------------------
       QUESTION FEEDBACK
    ------------------- */
    /*
    const feedbackText = detail.isCorrect
      ? detail.feedbackOk
      : detail.feedbackError;

    if (!feedbackText) return;

    const feedbackDiv = document.createElement("div");
    feedbackDiv.className = `question-feedback ${
      detail.isCorrect ? "correct" : "incorrect"
    }`;

    feedbackDiv.innerHTML = `
      <span>${detail.isCorrect ? "✔" : "✖"}</span>
      ${feedbackText}
    `;

    qEl.appendChild(feedbackDiv);
    */
  });

  // See All/Correct/Incorrect answer questions
  // Show filters ONLY in results mode
  if (examResult?.done) {
    document.getElementById('resultFilters').style.display = 'flex';
    document.getElementById('submitBtn').style.display = 'none';
  }
}

// Filtering logic: All/correct/incorrect answer questions result
function filterResults(type){
  document.querySelectorAll('.question').forEach(q => {
    if(type === 'all'){
      q.style.display = '';
      return;
    }

    q.style.display =
      q.dataset.result === type ? '' : 'none';
  });
}

/***************************
Bottom toolbar
***************************/
function toggleToolbar(){
  const toolbar = document.querySelector('.gforms-toolbar');
  const handle = document.getElementById('toolbarHandle');

  toolbar.classList.toggle('collapsed');

  const isCollapsed = toolbar.classList.contains('collapsed');

  handle.textContent = isCollapsed ? '▲' : '▼';
  handle.setAttribute(
    'data-tooltip',
    isCollapsed ? 'Open panel' : 'Close panel'
  );
}

/***************************
Section
***************************/
function addSection(){
  const section = document.createElement('div');
  section.className = 'card';
  section.innerHTML = `
    <div class="section-label"></div>
    <input class="title-input" placeholder="Section title" />
    <input class="desc-input" placeholder="Section description" />
  `;
  questionsEl.appendChild(section);
  updateJSON();
  updateSectionNumbers();
}

// auto numbering
function updateSectionNumbers(){
  const sections = document.querySelectorAll('.section-label');
  sections.forEach((s, i) => {
    s.textContent = `Section ${i + 1} of ${sections.length}`;
  });
}

function updateTimerDisplay(){
  const hours = Math.max(0, Math.floor(timeLeft / 3600));
  const minutes = Math.max(0, Math.floor((timeLeft % 3600) / 60));
  const seconds = Math.max(0, timeLeft % 60);
  document.getElementById('timer').textContent =
    `Time Left: ${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

/***************************
Camera
***************************/
let camera = null;
let stream = null;
let isCameraStarted = false;

const video = document.getElementById('video');
const toggleRecordingBtn = document.getElementById('toggleRecording');
const downloadRecordingBtn = document.getElementById('downloadRecording');

async function startCamera(cameraSettings){
  if(stream) return; // already started
  
  camera = cameraSettings;

  let faceMesh = null;

  try {
    if(!camera.enabled) {
      document.getElementById("timer").style.display = "block";
      document.getElementById("video").style.display = "none";
      document.getElementById("overlay").style.display = "none";
      return
    }
    
    if(camera.enabled || camera.faceAbsence || camera.eyeTracking) {
    // Eye-Tracking
    faceMesh = new window.FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    }

    if(camera.faceAbsence || camera.eyeTracking) {
      faceMesh.setOptions({
        maxNumFaces: 1, // face detection
        refineLandmarks: true, // eye-tracking: gives iris landmarks (468-478)
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults(onResults);
    }

    // Start camera
    if(camera.enabled || camera.faceAbsence || camera.eyeTracking) {
    const cam = new window.Camera(video, {
      onFrame: async () => {
        await faceMesh.send({ image: video });
      },
      width: 480,
      height: 360,
    });
    cam.start();
    }

    if(camera.faceAbsence || camera.eyeTracking) {
      // set canvas size to video display size
      document.getElementById("overlay").style.display = "none"; // hide detection rectangle, hide = "none", show = "block"

      overlay.width = video.videoWidth || video.clientWidth;
      overlay.height = video.videoHeight || video.clientHeight;
    }

    if(camera.faceAbsence) {
      // Face detection
      // lazy-load TF and model after camera starts
      await loadModelIfNeeded();
      startDetectLoop();
    }

    if(camera.enabled || camera.faceAbsence || camera.eyeTracking) {
      console.log('Camera started');
      isCameraStarted = true;
    }

  } catch(e) {
    console.warn('Camera error', e);
    alert('❌ Camera error', e);
  }

  if(isCameraStarted){
  function stopCamera(){
    if (stream){
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    video.pause();
    video.srcObject = null;
    stopDetectLoop();
    console.log('Camera stopped');
    ctx && ctx.clearRect(0,0,overlay.width, overlay.height);
  }
  }
}

/***************************
Face detection
***************************/
let model = null;
let detectLoopId = null;
let overlay = document.getElementById('overlay');
let ctx = overlay.getContext('2d');
let lastFaceState = 'unknown'; // 'no_face'|'one_face'|'multi'

// Detection loop
let lastDetectTime = 0;
async function detectOnce(){
  if (!model || !video || video.readyState < 2) return;

  const now = performance.now();

  // throttle to ~700ms
  if (now - lastDetectTime < 600) return;
  lastDetectTime = now;
  const returnTensors = false;
  const predictions = await model.estimateFaces(video, returnTensors);

  // predictions is array of face objects with topLeft, bottomRight, probability
  ctx.clearRect(0,0,overlay.width, overlay.height);
  let state = 'no_face';

  //console.log('predictions.length = ', predictions.length);
  
  if (!predictions || predictions.length === 0) {
    state = 'no_face';
  } else if (predictions.length === 1) {
    state = 'one_face';

    // draw box
    const p = predictions[0];
    const [x1,y1] = p.topLeft;
    const [x2,y2] = p.bottomRight;
    const w = x2-x1, h = y2-y1;
    ctx.strokeStyle = 'rgba(6,182,212,0.9)';
    ctx.lineWidth = 3;
    ctx.strokeRect(x1, y1, w, h);
    // label
    ctx.fillStyle = 'rgba(6,182,212,0.1)';
    ctx.fillRect(x1, y1-24, 120, 20);
    ctx.fillStyle = '#042028';
    ctx.font = '14px sans-serif';
    ctx.fillText('face detected', x1+6, y1-9);
  } else {
    state = 'multi';
    // draw multi boxes
    predictions.forEach(p => {
      const [x1,y1] = p.topLeft;
      const [x2,y2] = p.bottomRight;
      const w = x2-x1, h = y2-y1;
      ctx.strokeStyle = 'rgba(255,110,96,0.95)';
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, w, h);
    });
    ctx.fillStyle = 'rgba(255,110,96,0.12)';
    ctx.fillRect(8, 8, 220, 26);
    ctx.fillStyle = '#3a0f07';
    ctx.font = '14px sans-serif';
    ctx.fillText('Multiple faces detected — please have only one person', 14, 25);
  }

  // state transitions
  if (state !== lastFaceState) {
    // log event
    if (state === 'no_face') {
      alert('No face detected. Please stay in view of the camera.');
      console.log('No face detected. Please stay in view of the camera.');
    } else if (state === 'multi') {
      alert('Multiple faces detected. Only one person should take the exam.');
      console.log('Multiple faces detected. Only one person should take the exam.');
    } else if (state === 'one_face') {
      //alert('Single face detected');
      console.log('Single face detected');
    }
    lastFaceState = state;
  }
}

function startDetectLoop(){
  if (detectLoopId) return;
  detectLoopId = setInterval(() => {
    detectOnce().catch(e => console.error('detect error', e));
  }, 700);
  console.log('Detection started');
}

function stopDetectLoop(){
  if (detectLoopId) {
    clearInterval(detectLoopId);
    detectLoopId = null;
  }
  console.log('Detection stopped');
}

function loadScript(src){
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = e => reject(e);
    document.head.appendChild(s);
  });
}

// Load TF.js and BlazeFace if needed
async function loadModelIfNeeded(){
  if (model) return;

  console.log('Loading model (may take a few seconds)...');

  // load TF.js
  if (!window.tf) {
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.20.0/dist/tf.min.js');
  }
  if (!window.blazeface) {
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js');
  }
  // load model
  model = await blazeface.load();
  console.log('Model loaded');
}

/***************************
Eye-Tracking
***************************/
const canvas = document.getElementById("overlay");

let lastBlinkTime = 0;
let blinkCount = 0;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getEyeOpenness(landmarks, top, bottom) {
  return distance(landmarks[top], landmarks[bottom]);
}

function analyzeEyes(landmarks) {
  // MediaPipe eye landmark indices
  const LEFT_TOP = 159;
  const LEFT_BOTTOM = 145;
  const RIGHT_TOP = 386;
  const RIGHT_BOTTOM = 374;

  const leftOpenness = getEyeOpenness(landmarks, LEFT_TOP, LEFT_BOTTOM);
  const rightOpenness = getEyeOpenness(landmarks, RIGHT_TOP, RIGHT_BOTTOM);

  const avgOpenness = (leftOpenness + rightOpenness) / 2;

  if (avgOpenness < 0.01) {
    const now = Date.now();
    if (now - lastBlinkTime > 300) {
      blinkCount++;
      lastBlinkTime = now;
    }

    //alert('NO BLINK');
    return "BLINK";
  }

  return "OPEN";
}

function getGazeDirection(landmarks) {
  // Eye corner indices
  const leftEyeLeft = landmarks[33];
  const leftEyeRight = landmarks[133];
  const leftPupil = landmarks[468]; // iris center

  const eyeWidth = distance(leftEyeLeft, leftEyeRight);
  const pupilOffset = (leftPupil.x - leftEyeLeft.x) / eyeWidth;

  if (pupilOffset < 0.32) {
    alert('NO LOOK TO THE RIGHT');
    return "LOOKING RIGHT";
  }

  if (pupilOffset > 0.68) {
    alert('NO LOOK TO THE LEFT');
    return "LOOKING LEFT";
  }

  return "CENTER";
}

function onResults(results) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    ctx.fillStyle = "red";
    ctx.fillText("FACE NOT DETECTED", 10, 20);
    return;
  }

  const landmarks = results.multiFaceLandmarks[0];

  // Draw mesh
  window.drawConnectors(ctx, landmarks, window.FACEMESH_TESSELATION, { color: "#0f0" });

  if(camera.eyeTracking) {
    // Eye Tracking
    // Eye state
    const eyeState = analyzeEyes(landmarks);
    const gaze = getGazeDirection(landmarks);
  }

  ctx.fillStyle = "yellow";
/*
  console.log('Eyes: ', eyeState);
  console.log('Gaze: ', gaze);
  console.log('Blink Count: ', blinkCount);
  */
}

/***************************
Microphone
***************************/
// Config
const NOISE_THRESHOLD = 0.16;   // When “too loud”
const SPEAK_THRESHOLD = 0.18;   // When voice detected
const MAX_NOISE_TIME = 5;       // Seconds before auto-fail

let noiseSeconds = 0;
let lastNoiseTime = 0;
let failed = false;

async function startMicrophone(microphoneSettings) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
    if(microphoneSettings.loudNoise) {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;

      const freqAnalyser = audioCtx.createAnalyser();
      freqAnalyser.fftSize = 512;

      const mic = audioCtx.createMediaStreamSource(stream);
      mic.connect(analyser);
      mic.connect(freqAnalyser);

      const timeData = new Uint8Array(analyser.fftSize);
      const freqData = new Uint8Array(freqAnalyser.frequencyBinCount);

      function update() {
        analyser.getByteTimeDomainData(timeData);
        freqAnalyser.getByteFrequencyData(freqData);

        // Calculate volume (RMS)
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
            const v = (timeData[i] - 128) / 128;
            sum += (v * v);
        }
        const volume = Math.sqrt(sum / timeData.length);

        //console.log('volume = ', volume);

        // Check for noise / speaking
        if (volume > SPEAK_THRESHOLD) {
            console.log('🎤 Someone is speaking!');
            alert('🎤 Someone is speaking!');
            lastNoiseTime = Date.now();
        } else if (volume > NOISE_THRESHOLD) {
            console.log('⚠ Too loud!');
            alert('⚠ Too loud!');
            lastNoiseTime = Date.now();
        } else {
            //alertBox.textContent = "";
        }

        // Count continuous noise time
        if (Date.now() - lastNoiseTime < 1000)
          noiseSeconds++;
        else
          noiseSeconds = 0;

        //console.log('noiseSeconds = ', noiseSeconds);

        // Auto-fail
        if (!failed && noiseSeconds >= MAX_NOISE_TIME) {
            failed = true;
            alert("❌ Exam failed: too much noise.");
        }

        requestAnimationFrame(update);
      }

      update();
    }
  } catch (e) {
    console.warn("Microphone error:", e);
    alert("❌ Microphone error: " + e.message);
  }
}

/***************************
Settings
***************************/
// General Settings
function applySettingsGeneral(general){
  if(!general) return;
  
  if(examResult?.done) return;

  // View toggle questions (One by One/All)
  const viewToggle = document.getElementById('viewToggle');
  const oneByOneToggle = document.getElementById('oneByOneToggle');

  if (examResult?.done) {
    viewToggle.style.display = 'none';
    oneByOneToggle.checked = false;
    return;
  }

  if(general.viewToggleQuestions){
    viewToggle.style.display = 'flex';
  } else {
    viewToggle.style.display = 'none';
    oneByOneToggle.checked = false;
  }

  // View questions One by One
  if(general.viewQuestions) {
    oneByOneToggle.checked = true;
    toggleQuestionView(oneByOneToggle);
  }

  // Shuffle questions
  if(general.shuffleQuestions) {
    
  }

  // Shuffle options
  if(general.shuffleOptions) {
    
  }
}

// Proctor Timer Settings
let timeLeft = 1 * 60 * 60;   // default: 1 hour
let timerInterval = null;

function applySettingsProctorTimer(timerSettings){
  if(!timerSettings) return;
  
  if(examResult?.done) return;

  if(examResult?.done) {
    //localStorage.removeItem("examResult");
    clearInterval(timerInterval);
    return;
  }

  if(!timerSettings.enabled) {
    document.getElementById("timer").style.display = "block";
    return;
  }

  if(timerSettings.enabled) {
    const hours = Number(timerSettings.hours || 0);
    const minutes = Number(timerSettings.minutes || 0);
    const seconds = Number(timerSettings.seconds || 0);

    timeLeft = (hours * 3600) + (minutes * 60) + seconds;

    // you can set timeLeft before startingExam if desired
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      timeLeft--;

      updateTimerDisplay();

      if(timeLeft <= 0){
        clearInterval(timerInterval);
        autoSubmitExam();
      }
    }, 1000);
  }
}

// Proctor Camera Settings
async function applySettingsProctorCamera(cameraSettings) {
  if(!cameraSettings) return;

  if(examResult?.done) return;
  
  await startCamera(cameraSettings);
}

// Proctor Microphone Settings
async function applySettingsProctorMicrophone(microphoneSettings) {
  if(!microphoneSettings) return;

  if(examResult?.done) return;

  if(microphoneSettings.enabled || microphoneSettings.loudNoise) {
    await startMicrophone(microphoneSettings);
  }
}

// ----------------------------------
// Proctor Screen Settings
// Screen-switch-detection
let screen = null;
let violations = 0;
const MAX_VIOLATIONS = 10;

function log(msg) {
    const t = new Date().toLocaleTimeString();
    logBox.textContent += `[${t}] ${msg}\n`;
}

function addViolation(reason) {
    violations++;
    alert(`❌ Violation #${violations}: ${reason}`);
    //log(`❌ Violation #${violations}: ${reason}`);

    if (violations >= MAX_VIOLATIONS) {
        alert("❌ Exam failed. Too many violations.");
        // End exam
    }
}

function applySettingsProctorScreen(screenSettings) {

  if(!screenSettings) return;

  if(examResult?.done) return;

  screen = screenSettings;

  if(screen.tabSwitch) {
    // Screen-switch detection (tab change + blur/focus)
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) addViolation("Tab switch or minimize");
    });
    /*
    window.addEventListener("blur", () => {
        addViolation("Window lost focus (possible Alt+Tab)");
    });
    */
  }
  
  //---------------------------//

  if(screen.fullscreenExit) {
    // Detect leaving fullscreen
    document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) addViolation("Exited fullscreen");
    });
  }

  //---------------------------//

  if(screen.blockKeyShortcuts) {
    // Block Keyboard Shortcuts (as many as possible)
    document.addEventListener("keydown", (e) => {
        const blockedCombos = [
            e.ctrlKey && e.key === "t",
            e.ctrlKey && e.key === "w",
            e.ctrlKey && e.key === "n",
            e.ctrlKey && e.key === "r",
            e.key === "F11",
            e.key === "F5",
            e.key === "Escape",
            //e.key === "F12", // Devtools
        ];

        if (blockedCombos.some(Boolean)) {
            e.preventDefault();
            addViolation(`Blocked shortcut: ${e.key}`);
        }
    });
  }
}

//---------------------------//

if(screen!=null && screen.devToolsOpen) {
  // Detect DevTools Opening (3 methods combined)
  // Method A — Size check
  /*
  setInterval(() => {
    if(isCameraStarted) {
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold) {
          addViolation("DevTools detected (resize)");
      }
    }
  }, 1000);
  */
  // Method B — Debugger trap
  let check = false;
  setInterval(() => {
    if(isCameraStarted) {
      const start = Date.now();
      if (Date.now() - start > 10) {
          addViolation("DevTools detected (debugger slowdown)");
      }
    }
  }, 2000);

  // Method C — Console open check
  console.log("%cSTOP", "font-size: 100px; color: red;");
}
//---------------------------//

if(screen!=null && screen.secondMonitor) {
  // Fake “Second Monitor Detection” (best possible)
  let originalWidth = window.screen.width;

  setInterval(() => {
    if(isCameraStarted) {
      if (window.screen.width !== originalWidth) {
          addViolation("Possible second monitor usage");
      }
    }
  }, 3000);
}

/***************************
Initialization
***************************/
//async function handleImport(){
window.onload = async function() {

  // Read JSON file (awaitable)
  const json = localStorage.getItem("formContent");
  examData = JSON.parse(json);

  debugger;
  if(examResult?.done)
    document.getElementById('goResults').style.display = 'block';

    // Apply Settings/Proctor/Camera
  await applySettingsProctorCamera(examData.settings.camera);

  // Apply Settings/Proctor/Microphone
  await applySettingsProctorMicrophone(examData.settings.microphone);

  // Load questions
  loadFormFromJSON(examData);

  // Apply borders per question
  applyResultHighlighting();

  // Apply Settings/General
  applySettingsGeneral(examData.settings.general);
  
  //addQuestion();

  // Apply Settings/Proctor/Timer
  applySettingsProctorTimer(examData.settings.timer);

  // Apply Settings/Proctor/Screen
  applySettingsProctorScreen(examData.settings.screen);
}

new Sortable(questionsEl, {
  handle: '.drag',
  animation: 150,
  onEnd: () => {
    updateJSON();
    updateQuestionCounters();
  }
});