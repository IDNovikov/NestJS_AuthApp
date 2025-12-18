import { io } from 'socket.io-client';
//@ts-ignore
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsImVtYWlsIjoiYmlsbGNvenlAeWFuZGV4LnJ1Iiwicm9sZSI6IlVTRVIiLCJqdGkiOiI1OWQzNTY0Zi03NDM3LTQxZWMtYWJjZC04MTgyMDQ0MjAxMzYiLCJpYXQiOjE3NjU2MjkyMTgsImV4cCI6MTc2NjIzNDAxOH0.cMpYo0Xt5KmUplW75wMxYRsoYVH49ko2wHi3u5kXMW8';

const TOKEN_2 =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsImVtYWlsIjoiYmlsbGNvenlAeWFuZGV4LnJ1Iiwicm9sZSI6IlVTRVIiLCJqdGkiOiI1OWQzNTY0Zi03NDM3LTQxZWMtYWJjZC04MTgyMDQ0MjAxMzYiLCJpYXQiOjE3NjU2MjkyMTgsImV4cCI6MTc2NjIzNDAxOH0.cMpYo0Xt5KmUplW75wMxYRsoYVH49ko2wHi3u5kXMW8';

// ████████████████████████████████████████████████████████
// SOCKET.IO FULL CHAT TEST MODULE
// tests:
// 1) auth connect
// 2) join room
// 3) one sends message
// 4) second receives message
// 5) edit message
// 6) both receive edited
// 7) duplicate prevention
// 8) reconnect + rejoin test
// ████████████████████████████████████████████████████████

const CHAT_ID = 1;

// GLOBAL STATE for validation
const state = {
  connects: 0,
  joins: 0,
  sends: 0,
  receivesNew: { A: 0, B: 0 },
  receivesEdit: { A: 0, B: 0 },
  reconnects: 0,
};
//@ts-ignore
function diag(...msg) {
  console.log(`[${new Date().toISOString()}]`, ...msg);
}
//@ts-ignore
function createTestClient(name, token) {
  const socket = io('ws://localhost:5000/chat', {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 500,
  });

  socket.on('connect', () => {
    state.connects++;
    diag(`✔ CONNECT [${name}]`, socket.id);

    socket.emit('chat.join', CHAT_ID);
    diag(`✔ JOIN [${name}] room ${CHAT_ID}`);
  });

  // DEBUG LOGGER FOR ALL EVENTS
  socket.onAny((event, data) => {
    diag(`⚡ EVENT on [${name}]`, event, data);
  });

  socket.on('message.new', (msg) => {
    //@ts-ignore
    state.receivesNew[name]++;
    diag(`📩 NEW received [${name}]`, msg);
  });

  socket.on('message.edited', (msg) => {
    //@ts-ignore
    state.receivesEdit[name]++;
    diag(`✏ EDIT received [${name}]`, msg);
  });

  socket.on('exception', (err) => {
    diag(`❌ WS EXCEPTION [${name}]`, err);
  });

  socket.on('disconnect', (reason) => {
    diag(`❌ DISCONNECT [${name}]`, reason);
  });

  socket.on('reconnect', (attempt) => {
    state.reconnects++;
    diag(`🔁 RECONNECT [${name}] attempt=${attempt}`);
    socket.emit('chat.join', CHAT_ID);
    diag(`🔁 auto-rejoined [${name}]`);
  });

  return socket;
}

// ------ clients ------
const A = createTestClient('A', TOKEN);
const B = createTestClient('B', TOKEN_2);

// ------ TEST FLOW ------

// 1. SEND MESSAGE
setTimeout(() => {
  diag('➡ TEST STEP 1: SEND MESSAGE from A');
  A.emit('message.send', {
    chatId: CHAT_ID,
    text: `msg from A`,
  });
}, 700);

// 2. EDIT MESSAGE (replace msgId manually when see "EVENT message.new")
//@ts-ignore
let EDIT_MESSAGE_ID = null;
//@ts-ignore
function autoExtractMessageId(msg) {
  //@ts-ignore
  if (!EDIT_MESSAGE_ID) {
    EDIT_MESSAGE_ID = msg.id;
    diag('🆔 saved messageId for edit:', EDIT_MESSAGE_ID);
    runEditTest();
  }
}

A.on('message.new', autoExtractMessageId);
B.on('message.new', autoExtractMessageId);

function runEditTest() {
  setTimeout(() => {
    diag('➡ TEST STEP 2: EDIT MESSAGE from B');

    B.emit('message.edit', {
      chatId: CHAT_ID,
      //@ts-ignore
      messageId: EDIT_MESSAGE_ID,
      newText: 'edited by B',
    });
  }, 800);
}

// 3. FINISH AND DIAGNOSE
setTimeout(() => {
  diag('📊 FINAL DIAGNOSTICS:');
  console.log(JSON.stringify(state, null, 2));

  if (state.receivesNew.A === 0 || state.receivesNew.B === 0) {
    diag('❌ ERROR: broadcast new not delivered to both');
  }

  if (state.receivesEdit.A === 0 || state.receivesEdit.B === 0) {
    diag('❌ ERROR: broadcast edit not delivered to both');
  }

  diag('🟢 TEST COMPLETE - CLOSE');
  A.close();
  B.close();
  //@ts-ignore
  process.exit();
}, 6000);
