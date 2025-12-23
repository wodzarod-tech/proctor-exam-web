  const result = JSON.parse(localStorage.getItem("examResult"));

  if (!result) {
    document.body.innerHTML = "<h2>No result found</h2>";
  } else {
    document.getElementById("score").textContent =
      `${result.score} / ${result.total}`;

    const status = result.percentage >= result.scoreMin ? "✅ PASSED" : "❌ NOT PASSED";

    let html = `
      <p>
        <strong>
          Score: ${result.percentage}% → <b>${status}</b>
        </strong>
      </p>
      <p>
        Score min to pass: ${result.scoreMin}%</b>
      </p>
    `;

    if (result.percentage >= 70) {
      result.certificateId = generateCertificateId();

      html += `
        <button id="certificateBtn" onclick="goToCertificate()">
          🎓 Get Certificate
        </button>
      `;
    }

    result.done = true;
    localStorage.setItem("examResult", JSON.stringify(result));

    document.getElementById("summary").innerHTML = html;

    // Result details
    /*
    const list = document.createElement("ul");

    result.details.forEach(d => {
      const li = document.createElement("li");
      li.textContent = `${d.question} — ${d.isCorrect ? "✔ Correct" : "✖ Incorrect"}`;
      list.appendChild(li);
    });
    
    document.querySelector(".card").appendChild(list);
    */
  }

// get certificate
function goToCertificate(){
  window.location.href = "certificate.html";
}

// Generate Certificate ID
function generateCertificateId(){
  return "CERT-" + Date.now().toString(36).toUpperCase();
}