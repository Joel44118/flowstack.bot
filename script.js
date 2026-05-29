const API_KEY =
"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";

/*
====================================
MODEL SECTION
====================================

You can change the model HERE later.

Current model:
deepseek/deepseek-chat-v3-0324:free
*/

 model:
"mistralai/mistral-7b-instruct:free",

const messagesContainer =
document.getElementById("messages");

const orb =
document.querySelector(".orb");

/*
====================================
MEMORY SYSTEM
====================================
*/

let conversationHistory =
JSON.parse(
localStorage.getItem("memory")
) || [];

function saveMemory() {

  localStorage.setItem(
    "memory",
    JSON.stringify(
      conversationHistory
    )
  );
}

function addMessage(text, sender) {

  const message =
  document.createElement("div");

  message.classList.add("message");

  message.innerText =
  `${sender}: ${text}`;

  messagesContainer.appendChild(
    message
  );

  messagesContainer.scrollTop =
  messagesContainer.scrollHeight;
}

function loadMessages() {

  conversationHistory.forEach(
    msg => {

      const sender =
      msg.role === "assistant"
      ? "Flow"
      : "You";

      addMessage(
        msg.content,
        sender
      );
    }
  );
}

loadMessages();

/*
====================================
VOICE SYSTEM
====================================
*/

function speak(text) {

  window.speechSynthesis.cancel();

  const speech =
  new SpeechSynthesisUtterance(
    text
  );

  speech.lang = "en-US";

  speech.rate = 1;

  speech.pitch = 1;

  speech.volume = 1;

  orb.style.boxShadow =
  "0 0 140px #38bdf8";

  speech.onend = () => {

    orb.style.boxShadow =
    "0 0 60px #38bdf8";
  };

  window.speechSynthesis.speak(
    speech
  );
}

/*
====================================
SEND MESSAGE
====================================
*/

async function sendMessage() {

  const input =
  document.getElementById(
    "user-input"
  );

  const text =
  input.value.trim();

  if(!text) return;

  addMessage(text, "You");

  conversationHistory.push({

    role: "user",

    content: text
  });

  saveMemory();

  input.value = "";

  orb.style.transform =
  "scale(1.1)";

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

          model: MODEL,

          messages: [

            {
              role: "system",

              content: `
You are Flow.

A futuristic AI assistant.

You are:
- intelligent
- calm
- helpful
- conversational
- modern
- efficient
`
            },

            ...conversationHistory
          ]
        })
      }
    );

    const data =
    await response.json();

    console.log(data);

    if(!data.choices) {

      addMessage(
        "API Error: " +
        JSON.stringify(data),
        "System"
      );

      return;
    }

    const botReply =
    data.choices[0]
    .message.content;

    addMessage(
      botReply,
      "Flow"
    );

    conversationHistory.push({

      role: "assistant",

      content: botReply
    });

    saveMemory();

    speak(botReply);

  } catch(error) {

    console.error(error);

    addMessage(
      "System error occurred.",
      "System"
    );
  }

  orb.style.transform =
  "scale(1)";
}

/*
====================================
MICROPHONE SYSTEM
====================================
*/

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

  recognition.start();

  orb.style.boxShadow =
  "0 0 180px #38bdf8";

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

    addMessage(
      "Mic Error: " +
      event.error,
      "System"
    );
  };

  recognition.onend =
  function() {

    orb.style.boxShadow =
    "0 0 60px #38bdf8";
  };
}

/*
====================================
ENTER KEY SUPPORT
====================================
*/

document
.getElementById("user-input")
.addEventListener(
  "keydown",
  function(event) {

    if(event.key === "Enter") {

      sendMessage();
    }
  }
);

/*
====================================
BACKGROUND NETWORK EFFECT
====================================
*/

const canvas =
document.getElementById(
  "bg-canvas"
);

const ctx =
canvas.getContext("2d");

canvas.width =
window.innerWidth;

canvas.height =
window.innerHeight;

let particles = [];

for(let i = 0; i < 80; i++) {

  particles.push({

    x: Math.random() *
    canvas.width,

    y: Math.random() *
    canvas.height,

    vx: (Math.random() - 0.5)
    * 0.5,

    vy: (Math.random() - 0.5)
    * 0.5
  });
}

function animateBackground() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  for(let p of particles) {

    p.x += p.vx;

    p.y += p.vy;

    if(
      p.x < 0 ||
      p.x > canvas.width
    ) p.vx *= -1;

    if(
      p.y < 0 ||
      p.y > canvas.height
    ) p.vy *= -1;

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      2,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
    "#38bdf8";

    ctx.fill();
  }

  for(let a of particles) {

    for(let b of particles) {

      const dx = a.x - b.x;

      const dy = a.y - b.y;

      const dist =
      Math.sqrt(dx * dx + dy * dy);

      if(dist < 120) {

        ctx.beginPath();

        ctx.moveTo(a.x, a.y);

        ctx.lineTo(b.x, b.y);

        ctx.strokeStyle =
        "rgba(56,189,248,0.08)";

        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(
    animateBackground
  );
}

animateBackground();
