# proctor-exam-web
Proctor Exam Web

## Features
1. Create questions dynamically
2. Choose Multiple choice, Checkboxes
3. Drag and drop questions and options with dotted handle
4. JSON output for Firebase
{
  "title": "",
  "description": "",
  "questions": [
    {
      "text": "",
      "type": "radio",
      "options": [
        {
          "text": "Option 1",
          "checked": true
        },
        {
          "text": "Option 2",
          "checked": false
        }
      ],
      "comment": "12343"
    }
  ]
}
5. Sections (Section 1 of 2)
6. Answer key selection
7. Required indicator (*)
8. Proctor settings:
   8.1. Timer:
        Timer Left: MM:ss
   8.2. Camera:
        Enable camera
        Face Detection: Detect Face absence
        Eye-Tracking:
          Gaze Direction: No look to the right or left. Always look to the center.
          Eye Openness: Open or Blink
   8.3. Microphone:
        Enable microphone
        Noise-detection: Detect loud background noise
          Someone is speaking
          Too loud
   8.4. Screen:
        Screen-switch-detection:
          Detect tab switching or minimize
          Detect fullscreen exit
          Detect DevTools Opening
          Detect leaving fullscreen
          Block Keyboard Shortcuts
          Fake "Second Monitor Detection"

9. Show all questions/One question at a time (exam mode / paginated)
10. Do options multiline
11. Auto-save while editing

Others: “Google Forms + Proctor exam system
Preview mode (student view)
Save / load from Firebase Firestore
Proctoring hooks (camera / mic / tab focus)
Settings
  Show One question/All questions

  📊 Auto-grade on submit

🔐 Lock exam after submit

⏱ Auto-submit when timer ends

Disable Submit until all required answered

📤 Send answers to Firebase

⚠ Turn timer red at last 60s

🔐 QR verification

🏫 Institution logo & signatures

🖋 Digital signature image

warning at last X minutes




<span>Score minimum to pass (%)</span>

<div class="toggle-inline">
  <label class="toggle-row">
    <input type="checkbox" data-proctor="timer-enabled" onchange="toggleTimer(this)" />
    <span>Timer Left (hour | minutes)</span>
  </label>

  <div class="timer-row" style="display:none">
    <input
      type="number"0
      class="timer-input"
      min="0"
      max="24"
      step="1"
      value="0"
      oninput="fixHour(this); updateTimerJSON()"
    />h
    <span>:</span>
    <input
      type="number"
      class="timer-input"
      min="0"
      max="59"
      step="1"
      value="0"
      oninput="fixMinutes(this); updateTimerJSON()"
    />min
  </div>
</div>

      hours: timerEnabled ? Number(timerInputs[0]?.value || 0) : 0,

gradeExamFromJSON

    // Auto-focus title text:
    // when clicking Add question, then cursor automatically appears in the title text
    setTimeout(() => {
      document.getElementById('formTitle')?.focus();
    }, 0);
    
    /* Visible only on active question */
    .card.active .opt-drag{
      opacity: 1;
      pointer-events: auto;
    }

create:
    .drag{
      display: flex;
      justify-content: center;
      align-items: center;

      width: 100%;
      height: 24px;

      margin: -8px 0 8px 0;   /* pull it slightly up like GForms */
      cursor: grab;
      user-select: none;

      color: #9aa0a6;
      font-size: 18px;
      line-height: 4;
    }

preview:
    .drag{
      display: none;
      justify-content: center;
      align-items: center;

      width: 100%;
      height: 24px;

      margin: -8px 0 8px 0;   /* pull it slightly up like GForms */
      cursor: grab;
      user-select: none;

      color: #9aa0a6;
      font-size: 18px;
      line-height: 4;
      pointer-events: none;
    }

create:
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

function previewExam() {

      <textarea class="q-title" placeholder="Question" rows="1"></textarea>

function addOption(btn){