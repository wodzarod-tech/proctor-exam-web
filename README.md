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
12. Preview mode (student view)
13. Save / load from Firebase Firestore
14. Proctoring hooks (camera / mic / tab focus)
15. 🔐 Lock exam after submit
16. ⏱ Auto-submit when timer ends
17. Disable Submit until all required answered
18. 📤 Send answers to Firebase
19. ⚠ Turn timer red at last 60s
20. 🔐 QR verification
21. 🏫 Institution logo & signatures
22. 🖋 Digital signature image
23. warning at last X minutes
  
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

    <div class="total-points">
      <span>Total points</span>
      <strong id="totalPoints">0</strong>
    </div>

## Deploy
https://superproctorexam.netlify.app/
