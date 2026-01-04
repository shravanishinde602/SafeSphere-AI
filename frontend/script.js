const scanBtn = document.getElementById("scanBtn");
const resultDiv = document.getElementById("result");
const inputType = document.getElementById("inputType");
const userInput = document.getElementById("userInput");
const btnText = document.getElementById("btnText");
const loader = document.querySelector(".loader");

scanBtn.addEventListener("click", async () => {
  const inputValue = userInput.value.trim();
  if (!inputValue) {
    alert("Please enter input");
    return;
  }

  // UI loading state
  resultDiv.classList.add("hidden");
  btnText.style.display = "none";
  loader.classList.remove("hidden");
  scanBtn.disabled = true;

  try {
    const response = await fetch("https://safesphere-ai.onrender.com/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputType: inputType.value,
        inputValue
      })
    });

    if (!response.ok) throw new Error("Server error");

    const data = await response.json();

    // Show result
    resultDiv.classList.remove("hidden");
    resultDiv.innerHTML = `
      <strong>${data.verdict}</strong><br/>
      Confidence: ${data.confidenceScore}%<br/>
      ${data.explanation}
    `;

    resultDiv.style.background =
      data.verdict === "Safe"
        ? "#2e7d32"
        : data.verdict === "Suspicious"
        ? "#f9a825"
        : "#c62828";

  } catch (err) {
    console.error(err);
    resultDiv.classList.remove("hidden");
    resultDiv.innerText = "Error analyzing input";
    resultDiv.style.background = "#c62828";
  }

  // Reset button
  btnText.style.display = "block";
  loader.classList.add("hidden");
  scanBtn.disabled = false;
});
