const chatBox = document.getElementById("chat-box");

const API_KEY = "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";

let conversationHistory =
  JSON.parse(localStorage.getItem("memory")) || [];

function getConversation(userMessage) {

  const systemPrompt = {
    role: "system",
    content: `
You are Orion, a smart AI assistant.

Personality:
- Conversational
- Loyal
- Helpful
- Intelligent
- Calm and natural

You remember previous conversations.
You assist the user with tasks,
productivity, ideas, and general help.
`
  };

  conversationHistory.push({
    role: "user",
    content: userMessage
  });

  return [
    systemPrompt,
    ...conversationHistory
  ];
}

function saveBotReply(reply) {

  conversationHistory.push({
    role: "assistant",
    content: reply
  });

  localStorage.setItem(
    "memory",
    JSON.stringify(conversationHistory)
  );
}

function addMessage(text, sender) {

  const message = document.createElement("div");

  message.classList.add("message");
  message.classList.add(sender);

  message.innerText = text;

  chatBox.appendChild(message);

  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {

  const input =
    document.getElementById("user-input");

  const text = input.value;

  if (text.trim() === "") return;

  addMessage(text, "user");
handleCommand(text);

  input.value = "";

  try {

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: getConversation(text)
        })
      }
    );

    const data = await response.json();

    console.log(data);

    const botReply =
      data.choices[0].message.content;

    addMessage(botReply, "bot");

    saveBotReply(botReply);

    speak(botReply);

  } catch(error) {

    console.error(error);

    addMessage(
      "Something went wrong.",
      "bot"
    );
  }
}

function speak(text) {

  window.speechSynthesis.cancel();

  const speech =
    new SpeechSynthesisUtterance(text);

  speech.lang = "en-US";

  speech.rate = 1;

  speech.pitch = 1;

  speech.volume = 1;

  window.speechSynthesis.speak(speech);
}

function startListening() {

  if (
    !('webkitSpeechRecognition' in window)
  ) {

    alert(
      "Speech recognition only works in Chrome."
    );

    return;
  }

  const recognition =
    new webkitSpeechRecognition();

  recognition.lang = "en-US";

  recognition.continuous = false;

  recognition.interimResults = false;

  recognition.start();

  recognition.onresult = function(event) {

    const transcript =
      event.results[0][0].transcript;

    document.getElementById(
      "user-input"
    ).value = transcript;

    sendMessage();
  };

  recognition.onerror = function(event) {

    console.error(event.error);

    alert(
      "Microphone error: " + event.error
    );
  };
}

function clearMemory() {

  localStorage.removeItem("memory");

  conversationHistory = [];

  alert("Memory cleared.");
}
function handleCommand(command) {

  command = command.toLowerCase();

  // Open websites

  if(command.includes("open youtube")) {

    window.open(
      "https://youtube.com",
      "_blank"
    );

    return;
  }

  if(command.includes("open google")) {

    window.open(
      "https://google.com",
      "_blank"
    );

    return;
  }

  if(command.includes("open github")) {

    window.open(
      "https://github.com",
      "_blank"
    );

    return;
  }

  // Google search

  if(command.startsWith("search for")) {

    const query =
      command.replace("search for", "");

    window.open(
      `https://www.google.com/search?q=${query}`,
      "_blank"
    );

    return;
  }

  // YouTube search

  if(command.startsWith("youtube search")) {

    const query =
      command.replace("youtube search", "");

    window.open(
      `https://www.youtube.com/results?search_query=${query}`,
      "_blank"
    );

    return;
  }
}