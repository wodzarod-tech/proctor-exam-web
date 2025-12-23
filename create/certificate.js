  const result = JSON.parse(localStorage.getItem("examResult"));

  // Security check
  if (!result || result.percentage < 70 || !result.certificateId) {
    document.body.innerHTML = "<h2>Access denied</h2>";
  } else {
    document.getElementById("examTitle").textContent = result.title;
    document.getElementById("examScore").textContent =
      `Final Score: ${result.percentage}%`;

    document.getElementById("certId").textContent = result.certificateId;
    document.getElementById("date").textContent =
      new Date().toLocaleDateString();
      
    // QR content
    const qrValue = `CERTIFICATE:${result.certificateId}`;
    
    // QR for verification URL -> verify.html
    //const qrValue = `https://yourdomain.com/verify.html?id=${result.certificateId}`;

    new QRCode(document.getElementById("qrcode"), {
        text: qrValue,
        width: 128,
        height: 128,
        correctLevel: QRCode.CorrectLevel.H
    });
  }

  function downloadPDF(){
    window.print(); // browser → Save as PDF
  }

// get Certificate ID
document.getElementById("certId").textContent = result.certificateId;