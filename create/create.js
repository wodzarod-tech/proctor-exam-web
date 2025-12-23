// question must have its own radio group name
let questionIdCounter = 0; // question ID

const questionsEl = document.getElementById('questions');
const outputEl = document.getElementById('output');

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
  // auto-resize: add question/option multiline
  if(e.target.classList.contains('q-title') ||
    e.target.classList.contains('opt-text')){
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  }

  updateJSON();
});

// Auto-save while editing
// Saves after typing stops
let autosaveTimer;

document.addEventListener('input', () => {
  clearTimeout(autosaveTimer);

  const data = outputEl.textContent;
  if(!data) return;

  autosaveTimer = setTimeout(() => {
    localStorage.setItem('formContent',data);
  }, 500);
});

// toolbar: blue active question indicator
document.addEventListener('click', e => {
  document.querySelectorAll('.card.question').forEach(card => {
    card.classList.remove('active');

    // collapse feedback when inactive
    const feedback = card.querySelector('.feedback');
    if (feedback) feedback.classList.add('collapsed');
  });

  const card = e.target.closest('.card.question');

  if(card) {
    card.classList.add('active');

    // auto-open feedback for active question
    const feedback = card.querySelector('.feedback');

    // Auto-open ONLY if user hasn't manually collapsed it
    if (feedback && !feedback.dataset.userCollapsed) {
      feedback.classList.remove('collapsed');
    }
  }
  else {
    document.activeElement.blur(); // zero cursor blinking when clicking outside
  }
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

    <textarea class="q-title" placeholder="Question" rows="1"></textarea>

    <select class="q-type" onchange="updateOptions(this)">
      <option value="radio">◉ One choice</option>
      <option value="checkbox">☑ Multiple choices</option>
    </select>

    <div class="options"></div>

    <div>
      <button class="btn-link" onclick="addOption(this)">Add option</button>
    </div>

    <div class="feedback collapsed">

      <!-- Toggle header -->
      <div class="feedback-toggle" onclick="toggleFeedback(this)">
        <span class="feedback-toggle-icon">▼</span>
        <span class="feedback-toggle-text">Answer feedback</span>
      </div>

      <!-- Collapsible content -->
      <div class="feedback-content">

        <div class="feedback-group ok">
          <div class="feedback-ok-label">
            <span class="feedback-icon">✔</span>
            <span>Correct:</span>
          </div>
          <textarea class="q-title q-comment-ok" rows="1" placeholder="Feedback"></textarea>
        </div>

        <div class="feedback-group error">
          <div class="feedback-error-label">
            <span class="feedback-icon">✖</span>
            <span>Incorrect:</span>
          </div>
          <textarea class="q-title q-comment-error" rows="1" placeholder="Feedback"></textarea>
        </div>

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

  // Auto-focus question text:
  // when clicking Add question, then cursor automatically appears in the question text
  setTimeout(() => {
    q.querySelector('.q-title').focus();
  }, 0);
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
    <input class="opt-icon" type="${type}"
    ${type === 'radio' ? `name="${qid}" data-was-checked="false"` : ''} />
    <textarea class="opt-text" rows="1"></textarea>
    <button class="btn-link g-tooltip" data-tooltip="Remove"
      onclick="removeOption(event, this)">✕</button>
  `;
    // assign name to radio inputs when adding options

  const optionNumber = getNextOptionNumber(q);
  const textInput = opt.querySelector('.opt-text');
  textInput.placeholder = `Option ${optionNumber}`; // option dynamic placeholder numbering

  options.appendChild(opt);

  enableOptionDrag(opt); // drag & drop per option

  updateJSON();

  // Auto-focus option text:
  // when clicking Add option, then cursor automatically appears in the question text
  setTimeout(() => {
    textInput.focus();
  }, 0);
}

function removeOption(e, btn){
  e.preventDefault();
  e.stopPropagation();

  const option = btn.closest('.option');
  option.remove();
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

// Auto-delete option if text is empty on blur
// An option will be auto-deleted on blur ONLY IF:
//   ✔ The text is empty (or whitespace)
//   ✔ There is more than one option in the question
//   ❌ It is not the last remaining option
document.addEventListener('blur', e => {
  const input = e.target;

  if (!input.classList.contains('opt-text')) return;

  const option = input.closest('.option');
  const optionsContainer = option.parentElement;

  // Trim text
  const value = input.value.trim();

  // Keep at least one option
  if (value === '' && optionsContainer.children.length > 1) {
    option.remove();
    updateJSON();
  }
}, true); // 👈 use capture so blur is detected

// auto-resize textareas when import JSON file
function autoResizeTextarea(el){
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

/***************************
Preview exam
***************************/
function previewExam() {
  const data = outputEl.textContent;
  if(!data) return;

  localStorage.setItem('formContent', data);

  // open preview in the same tab
  window.location.href = "preview.html";

  // Option 1: open preview in a new tab
  //window.open("preview.html", "_blank");

  // Option 2 (alternative): show preview modal
  // document.getElementById("previewModal").classList.add("open");
}

// toogle feedback collapsible
function toggleFeedback(el){
  event.stopPropagation();

  const feedback = el.closest('.feedback');
  const isCollapsed = feedback.classList.toggle('collapsed');

  // remember user intent
  feedback.dataset.userCollapsed = isCollapsed ? 'true' : '';

  // Optional: auto-resize textareas when opening
  if (!isCollapsed) {
    feedback.querySelectorAll('textarea')
      .forEach(autoResizeTextarea);
  }
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

function switchSettingsTab(name){
  document.querySelectorAll('.settings-tabs .tab')
    .forEach(t => t.classList.remove('active'));

  document.querySelectorAll('.tab-panel')
    .forEach(p => p.classList.remove('active'));

  document.querySelector(`[onclick="switchSettingsTab('${name}')"]`)
    .classList.add('active');

  document.getElementById(`tab-${name}`)
    .classList.add('active');
}

function saveProctorSettings(){
  updateJSON();

  const data = outputEl.textContent;
  localStorage.setItem('formContent', data);
  
  document.querySelector('.btn-save').disabled = true;

  closeProctorConfig();

  alert("Settings saved successfully");
}

// Score min
function toggleScoreMin(cb){
  const row = cb.closest('.tab-panel').querySelector('.score-row');
  row.style.display = cb.checked ? 'flex' : 'none';
}

// Timer
function toggleTimer(cb){
  const row = cb.closest('.tab-panel').querySelector('.timer-row');
  row.style.display = cb.checked ? 'flex' : 'none';
}

function fixHour(input){
  if (input.value > 23) input.value = 23;
  if (input.value < 0) input.value = 0;
}

function fixMinutes(input){
  if (input.value > 59) input.value = 59;
  if (input.value < 0) input.value = 0;
}

function updateTimerJSON(){
  const panel = document.getElementById('tab-proctor');
  const min = panel.querySelector('.timer-min')?.value || 0;
  const sec = panel.querySelector('.timer-sec')?.value || 0;

  const totalSeconds = (Number(min) * 60) + Number(sec);

  // save where you want (example)
  console.log('Timer (seconds):', totalSeconds);
}

// protect focus explicitly to edit input=numbers
document.querySelectorAll(".timer-input").forEach(input => {
  input.addEventListener("mousedown", e => e.stopPropagation());
  input.addEventListener("click", e => e.stopPropagation());
  input.addEventListener("focus", e => e.stopPropagation());
});
document.querySelectorAll(".score-input").forEach(input => {
  input.addEventListener("mousedown", e => e.stopPropagation());
  input.addEventListener("click", e => e.stopPropagation());
  input.addEventListener("focus", e => e.stopPropagation());
});

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
          text: textInput.value,
          checked: control.checked
        };
      }),
      feedbackOk: q.querySelector('.q-comment-ok')?.value || '',
      feedbackError: q.querySelector('.q-comment-error')?.value || ''
    });
  });

  form.settings = form.settings || getProctorSettings();

  outputEl.textContent = JSON.stringify(form, null, 2);
  //updateTotalPoints();
}

function isChecked(key){
  return document.querySelector(`[data-proctor="${key}"]`)?.checked || false;
}

function getProctorSettings(){

  // Score Min
  const scoreMinEnabled = isChecked('score-min');
  const scoreMinInput = document.querySelector('.score-input');

  // Timer
  const timerEnabled = isChecked('timer-enabled');
  const [hoursInput, minutesInput] = document.querySelectorAll('#tab-proctor .timer-input');

  return {
    general: {
      shuffleQuestions: isChecked('shuffle-questions'),
      shuffleOptions: isChecked('shuffle-options'),
      viewToggleQuestions: isChecked('view-toggle-questions'),
      viewQuestions: isChecked('view-questions'),
      scoreMin: scoreMinEnabled ? Number(scoreMinInput?.value || 0) : 0
    },
    timer: {
      enabled: timerEnabled,
      hours: timerEnabled ? Number(hoursInput?.value || 0) : 0,
      minutes: timerEnabled ? Number(minutesInput?.value || 0) : 0
    },
    camera: {
      enabled: isChecked('camera-enabled'),
      faceAbsence: isChecked('camera-face'),
      eyeTracking: isChecked('camera-eye')
    },
    microphone: {
      enabled: isChecked('microphone-enabled'),
      loudNoise: isChecked('noise-loud')
    },
    screen: {
      tabSwitch: isChecked('screen-tab'),
      fullscreenExit: isChecked('screen-fullscreen'),
      devToolsOpen: isChecked('screen-devtools'),
      leaveFullScreen: isChecked('screen-leave'),
      blockKeyShortcuts: isChecked('screen-keyshortcuts'),
      secondMonitor: isChecked('screen-secondmonitor')
    }
  };
}

// export JSON in a file
function exportJSON(){
  const data = outputEl.textContent;
  if(!data) return;

  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'form.json';
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// import JSON from file
function importJSON(){
  document.getElementById('jsonFileInput').click();
}

document.getElementById('jsonFileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(reader.result);

      loadFormFromJSON(data);

      outputEl.textContent = reader.result;
      localStorage.setItem('formContent', reader.result);

      // Apply settings automatically from JSON to modal
      if (data.settings) {
        applySettingsToProctorModal(data.settings);
      }

    }catch(err){
      alert('Invalid JSON file');
    }
  };
  reader.readAsText(file);

  // reset input so same file can be re-imported
  e.target.value = '';

  // Prevent page from staying at bottom after import
  window.scrollTo({ top: 0, behavior: 'instant' });

  // scroll to the title
  setTimeout(() => {
    const titleInput = document.getElementById('formTitle');

    if (titleInput) {
      // focus cursor
      titleInput.focus();

      // place cursor at end (or start if you prefer)
      titleInput.setSelectionRange(
        titleInput.value.length,
        titleInput.value.length
      );

      // scroll to title smoothly
      titleInput.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, 50);
});

// load JSON into editor
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
      autoResizeTextarea(optText);

      lastOpt.querySelector('.opt-icon').checked = !!opt.checked;
    });

    // feedback
    if(qData.feedbackOk){
      // auto-resize for feedback
      const feedbackOk = q.querySelector('.q-comment-ok');
      feedbackOk.value = qData.feedbackOk;
      autoResizeTextarea(feedbackOk);
    }
    if(qData.feedbackError){
      // auto-resize for feedback
      const feedbackError = q.querySelector('.q-comment-error');
      feedbackError.value = qData.feedbackError;
      autoResizeTextarea(feedbackError);
    }

  });

  // Auto-resize ALL on load
  //q.querySelectorAll('textarea').forEach(autoResizeTextarea);

  updateJSON();

  updateQuestionCounters();
}

// Apply settings automatically
function applySettingsToProctorModal(settings){
  if(!settings) return;

  // ---------- GENERAL ----------
  setCheckbox('shuffle-questions', settings.general?.shuffleQuestions);
  setCheckbox('shuffle-options', settings.general?.shuffleOptions);
  setCheckbox('view-toggle-questions', settings.general?.viewToggleQuestions);
  setCheckbox('view-questions', settings.general?.viewQuestions);
  setInputValue('score-min', 'score-input', 'score-row', settings.general?.scoreMin);

  // ---------- TIMER ----------
  setInputValue('timer-enabled', 'timer-input timer-input-hours', 'timer-row', settings.timer?.hours);
  setInputValue('timer-enabled', 'timer-input timer-input-mins', 'timer-row', settings.timer?.minutes);

  // ---------- CAMERA ----------
  setCheckbox('camera-enabled', settings.camera?.enabled);
  setCheckbox('camera-face', settings.camera?.faceAbsence);
  setCheckbox('camera-eye', settings.camera?.eyeTracking);

  // ---------- MICROPHONE ----------
  setCheckbox('microphone-enabled', settings.microphone?.enabled);
  setCheckbox('noise-loud', settings.microphone?.loudNoise);

  // ---------- SCREEN / SECURITY ----------
  setCheckbox('screen-tab', settings.screen?.tabSwitch);
  setCheckbox('screen-fullscreen', settings.screen?.fullscreenExit);
  setCheckbox('screen-devtools', settings.screen?.devToolsOpen);
  setCheckbox('screen-leave', settings.screen?.leaveFullScreen);
  setCheckbox('screen-keyshortcuts', settings.screen?.blockKeyShortcuts);
  setCheckbox('screen-secondmonitor', settings.screen?.secondMonitor);
}

function setCheckbox(key, value){
  if (typeof value !== 'boolean') return;

  const el = document.querySelector(`[data-proctor="${key}"]`);

  if (!el) return;

  el.checked = value;

  // trigger change if you have listeners
  el.dispatchEvent(new Event('change'));
}

function setInputValue(keyChk, key, cls, value){
  if (value === undefined || value === null) return;

  // keyChk
  const el = document.querySelector(`[data-proctor="${keyChk}"]`);
  if (!el) return;

  if(value>=0) {
    el.checked = true;

    // key
    const e2 = document.querySelector(`[class="${key}"]`);
    if (!e2) return;

    const e3 = document.querySelector(`[class="${cls}"]`);

    e2.value = value;
    e3.style.display = 'flex';
    e2.dispatchEvent(new Event('input'));
  }

  el.dispatchEvent(new Event('input'));
}

/***************************
Right toolbar
***************************/
/*
// toolbar appears only when a card is focused
document.addEventListener('click', e => {
  const card = e.target.closest('.card.question');
  const toolbar = document.querySelector('.gforms-toolbar');

  if(card){
    toolbar.style.opacity = '1';
    toolbar.style.pointerEvents = 'auto';
  } else {
    toolbar.style.opacity = '0';
    toolbar.style.pointerEvents = 'none';
  }
});
*/

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

/***************************
Initialization
***************************/
window.onload = async function() {

  setupSettingsChangeTracking();

  // Restore Auto-save while editing
  // Restore go back button from Preview
  // Read JSON file (awaitable)
  const json = localStorage.getItem("formContent");
  
  if(json) {
    examData = JSON.parse(json);
  
    // Load questions
    loadFormFromJSON(examData);
  
    outputEl.textContent = json;

    // Apply settings automatically from JSON to modal
    if (examData.settings) {
      applySettingsToProctorModal(examData.settings);
    }

    new Sortable(questionsEl, {
      handle: '.drag',
      animation: 150,
      onEnd: () => {
        updateJSON();
        updateQuestionCounters();
      }
    });

    // Auto-focus title text:
    // when clicking Add question, then cursor automatically appears in the title text
    setTimeout(() => {
      document.getElementById('formTitle')?.focus();
    }, 0);

  } else {
    new Sortable(questionsEl, {
      handle: '.drag',
      animation: 150,
      onEnd: () => {
        updateJSON();
        updateQuestionCounters();
      }
    });

    addQuestion();

    // Auto-focus title text:
    // when clicking Add question, then cursor automatically appears in the title text
    setTimeout(() => {
      document.getElementById('formTitle')?.focus();
    }, 0);
  }
}

// Settings: Enable Save on change
function setupSettingsChangeTracking(){
  const saveBtn = document.querySelector('.btn-save');
  if(!saveBtn) return;

  // All settings inputs
  const inputs = document.querySelectorAll(
    '#proctorModal [data-proctor], #proctorModal .timer-input'
  );

  inputs.forEach(input => {
    input.addEventListener('change', () => {
      saveBtn.disabled = false;
    });

    // for number inputs (MM:ss)
    input.addEventListener('input', () => {
      saveBtn.disabled = false;
    });
  });
}