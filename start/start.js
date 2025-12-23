/***************************
Import panel
***************************/
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
let importedFile = null;

function showStartButton() {
  document.getElementById('startExamBtn').style.display = 'block';
}

dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('dragover');

  importedFile = e.dataTransfer.files[0];

  if(importedFile){
    // show uploaded state
    dropzone.classList.add('uploaded');

    // remove previous file name if exists
    const existing = dropzone.querySelector('.file-name');
    if(existing) existing.remove();

    // show file name
    const nameEl = document.createElement('div');
    nameEl.className = 'file-name';
    nameEl.textContent = importedFile.name;
    dropzone.appendChild(nameEl);

    showStartButton();
  }
});

fileInput.onchange = e => {
  importedFile = e.target.files[0];

  if(importedFile){
    dropzone.classList.add('uploaded');

    const existing = dropzone.querySelector('.file-name');
    if(existing) existing.remove();

    const nameEl = document.createElement('div');
    nameEl.className = 'file-name';
    nameEl.textContent = importedFile.name;
    dropzone.appendChild(nameEl);

    showStartButton();
  }
};

async function handleImport(){
  if(!importedFile){
    alert("Please select a JSON file");
    return;
  }

  if(!importedFile.name.endsWith(".json")){
    alert("Only JSON files allowed");
    return;
  }

  try {
    localStorage.clear();
    
    // Read JSON file (awaitable)
    const examData = await readFileAsJSON(importedFile);
    localStorage.setItem("formContent", JSON.stringify(examData));

    // Hide Import modal
    document.getElementById('importDropzone').style.display = 'none';

    // Show Countdown modal
    showStartExamModal(async() => {
      window.location.href = "exam.html";
    });
    
  } catch(err) {
    alert('❌ File read error: ' + err);
  };
}

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
Countdown modal
***************************/
function showStartExamModal(onFinish){
  const modal = document.getElementById('startModal');
  const counter = document.getElementById('countdown');

  let time = 3;
  counter.textContent = time;
  modal.style.display = 'flex';

  const interval = setInterval(() => {
    time--;
    if(time === 0){
      clearInterval(interval);
      modal.style.display = 'none';
      onFinish && onFinish();
    } else {
      counter.textContent = time;
    }
  }, 1000);
}