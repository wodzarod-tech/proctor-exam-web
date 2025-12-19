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


        [checkbox] Eye-Tracking:
                   [checkbox] Gaze Direction: No look to the right or left. Always look to the center.
                   [checkbox] Eye Openness: Open or Blink

function getProctorSettings(){

      tabSwitch: isChecked('screen-tab'),
      fullscreenExit: isChecked('screen-fullscreen'),
      devToolsOpen: isChecked('screen-devtools'),
      leaveFullScreen: isChecked('screen-leave'),
      blockKeyShortcuts: isChecked('screen-keyshortcuts'),
      secondMonitor: isChecked('screen-secondmonitor')

preview:
  window.onload = async function() {
    