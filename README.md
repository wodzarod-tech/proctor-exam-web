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
