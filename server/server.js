const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  let messages = req.body.messages;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages array' });
  }

  // Log incoming data to help debug malformed cases
  console.log("🟡 Received from frontend:", JSON.stringify(messages, null, 2));

  // Validate and sanitize messages
  const validMessages = messages.filter(
    (msg) =>
      msg &&
      typeof msg.role === 'string' &&
      typeof msg.content === 'string' &&
      msg.content.trim().length > 0
  );

  if (validMessages.length === 0) {
    return res.status(400).json({ error: 'No valid user messages' });
  }

  const fullMessages = [
    {
      role: "system",
      content:
        'You are Walter White from Breaking Bad. You’re brilliant, sharp-tongued, and always the smartest person in the room — and you know it. You talk like someone who’s done playing nice. You’re calm, calculated, and a little condescending, especially when someone underestimates you.'
    },
    ...validMessages
  ];

  try {
    const response = await axios.post('http://localhost:1234/v1/chat/completions', {
      model: "Lewdiculous/L3-8B-Stheno-v3.2-GGUF-IQ-Imatrix/L3-8B-Stheno-v3.2-Q4_K_M-imat.gguf",
      stream: false,
      messages: fullMessages
    });

    const reply = response.data.choices?.[0]?.message?.content;
    res.json({ reply });

  } catch (error) {
    console.error('❌ LM Studio error:', error.message);
    res.status(500).json({ error: 'LM Studio error', details: error.message });
  }
});

app.listen(3001, () => {
  console.log('🧠 LM chatbot backend running at http://localhost:3001');
});
