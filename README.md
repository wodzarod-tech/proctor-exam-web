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

---
  
PENDINGS:
1. In create.html addSection().
2. Shuffle questions
3. Shuffle options
4. En preview param set logo company in certificado
5. Add images in question and option, add atributtes font bold color text in question and option
6. In preview when submit y falta checkbox una requiere question debe mostrar mensaje question requerida y no avanzar.
7. no show JSON:
  <!-- JSON view -->
  <div style="display:none">
    <h3 >Form JSON</h3>
    <pre id="output"></pre>
  </div>
8. when subbmit automatically must to appear the result page

2. add button to see correct and incorrect questions
2. impl start exam
3. deploy free
4. sell it


  <button id="goBack" class="g-tooltip" data-tooltip="Back to editor" onclick="window.location.href='create.html'">⬅ Back</button>

it works. Now I have this preview.html, want to put the id="viewToggle" in the same row of goBack button but in the right corner:






function submitExam(){
  clearInterval(timerInterval);

window.onload = async function() {

applySettingsProctorTimer

    if(examResult?.certificateId) {
      localStorage.removeItem("examResult");
