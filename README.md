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
   8.1. Timer
   8.1. Face Detection
   8.2. Screen-switch-detection
   8.3. Noise-detection
   8.4. Eye-tracking
9. Show all questions/One question at a time (exam mode / paginated)

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



***********************************************

function handleImport(){
  
/***************************
Import panel
***************************/
async function handleImport(){

  /* -------------------------
   Exam parsing & rendering
   ------------------------- */
let answers = [];        // expected answers, in order

let recordingActive = false;
let oneAtTime = true;
let currentIndex = 0;

Violation #2: Tab switch or minimize

Screen-switch-detection

---

async function handleImport() -> preview

function importJSON() -> create

function exportJSON(){
  const data = outputEl.textContent;
  if(!data) return;

I have:

I have this button, do open preview.html in the same tab : 
<button class="g-tooltip" data-tooltip="Preview exam" onclick="previewExam()">👁️</button>

function previewExam() {
  const data = outputEl.textContent;
  if(!data) return;

  localStorage.setItem('formContent', data);
  debugger;
  // Option 1: open preview in a new tab
  window.open("preview.html", "_blank");

  // Option 2 (alternative): show preview modal
  // document.getElementById("previewModal").classList.add("open");
}

loadFormFromJSON

updateJSON

  formTitle.value = data.title || '';
  formDesc.value = data.description || '';
  JSON.stringify
  JSON.parse

updateSubmitVisibility

showAllQuestions
toggle.checked

submitBtn.style.display = 'inline-block';
    document.getElementById('questionNav').style.display = 'block';

<div id="timer">Time Left: --:--</div>



<div id="examTimer" class="exam-timer">
  ⏱ <span id="timeLeft">00:00</span>
</div>

function startTimer(){







  
this is the final boss feature.