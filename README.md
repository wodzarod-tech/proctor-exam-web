# proctor-exam-web
Proctor Exam Web

## Features
1. Face Detection
2. Screen-switch-detection
3. Noise-detection
4. Eye-tracking
5. Proctor settings
  5.1. Timer

<input class="opt-icon" type="${type}" ${type === 'radio' ? `name="${qid}" data-was-checked="false"` : ''} />

function loadFormFromJSON(data){

handleImport
importJSON


document.getElementById('jsonFileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(reader.result);

      // SHOW EDITOR, HIDE START SCREEN
      document.getElementById('startScreen').style.display = 'none';
      
      // Countdown modal
      showStartExamModal(() => {
        document.getElementById('editorApp').style.display = 'block';
      });

      loadFormFromJSON(data);
    }catch(err){
      alert('Invalid JSON file');
    }
  };
  reader.readAsText(file);

  // reset input so same file can be re-imported
  e.target.value = '';
});
