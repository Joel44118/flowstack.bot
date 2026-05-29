const API_KEY = "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";

const statusText =
document.getElementById("status");

const canvas =
document.getElementById("orb-canvas");

const ctx =
canvas.getContext("2d");

canvas.width =
window.innerWidth;

canvas.height =
window.innerHeight;

let orbSize = 120;

let pulse = 0;

let isSpeaking = false;

function animateOrb() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  pulse += 0.03;

  const size =
    orbSize +
    Math.sin(pulse) * 10;

  const glow =
    isSpeaking ? 40 : 20;

  const gradient =
    ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      20,
      canvas.width / 2,
      canvas.height / 2,
      size
    );

  gradient.addColorStop(
    0,
    "#38bdf8"
  );

  gradient.addColorStop(
    1,
    "transparent"
  );

  ctx.beginPath();

  ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    size,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = gradient;

  ctx.shadowBlur = glow;

  ctx.shadowColor = "#38bdf8";

  ctx.fill();

  requestAnimationFrame(
    animateOrb
  );
}

animateOrb();

function speak(text) {

  isSpeaking = true;

  statusText.innerText =
    "Flow is speaking...";

  window.speechSynthesis.cancel();

  const speech =
    new SpeechSynthesisUtterance(text);

  speech.lang = "en-US";

  speech.rate = 1;

  speech.pitch = 1;

  speech.volume = 1;

  speech.onend = () => {

    isSpeaking = false;

    statusText.innerText =
      "Awaiting command...";
  };

  window.speechSynthesis.speak(
    speech
  );
}

async function sendMessage() {

  const input =
    document.getElementById(
      "user-input"
    );

  const text = input.value;

  if(!text.trim()) return;

  input.value = "";

  statusText.innerText =
    "Thinking...";

  try {

    const response =
      await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Authorization":
            `Bearer ${API_KEY}`,

            "Content-Type":
            "application/json"
          },

          body: JSON.stringify({
            model:
            "mistralai/mistral-7b-instruct:free",

            messages: [
              {
                role: "system",

                content: `
You are Flow,
a futuristic AI assistant.

You are conversational,
intelligent,
calm,
helpful,
and futuristic.
`
              },

              {
                role: "user",
                content: text
              }
            ]
          })
        }
      );

    const data =
      await response.json();

    console.log(data);

    const botReply =
      data.choices[0]
      .message.content;

    speak(botReply);

  } catch(error) {

    console.error(error);

    statusText.innerText =
      "Error occurred.";
  }
}

let recognition;

function startListening() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if(!SpeechRecognition) {

    alert(
      "Speech recognition unsupported."
    );

    return;
  }

  recognition =
    new SpeechRecognition();

  recognition.lang = "en-US";

  recognition.continuous = false;

  recognition.interimResults = false;

  statusText.innerText =
    "Listening...";

  recognition.start();

  recognition.onresult =
  function(event) {

    const transcript =
      event.results[0][0]
      .transcript;

    document.getElementById(
      "user-input"
    ).value = transcript;

    sendMessage();
  };

  recognition.onerror =
  function(event) {

    console.error(event.error);

    statusText.innerText =
      "Mic error: " +
      event.error;
  };

  recognition.onend =
  function() {

    if(statusText.innerText
      === "Listening...") {

      statusText.innerText =
        "Awaiting command...";
    }
  };
}

setInterval(() => {

  startListening();

}, 15000);
