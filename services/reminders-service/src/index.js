import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;
const SAIIUT_BASE = process.env.SAIIUT_BASE || 'http://localhost:4001';

// --- In-memory storage (demo) ---
const db = {
  window: null,
  students: new Map(), // id -> {id, name, phone, email, saiiut_id, status, attempts, nextAttemptAt}
  attempts: [], // {id, student_id, channel, attempt_no, sent_at, status}
  paused: false
};

function now() { return new Date(); }
function withinQuietHours(date) {
  const [qsH, qsM] = (process.env.QUIET_START || '22:00').split(':').map(Number);
  const [qeH, qeM] = (process.env.QUIET_END || '07:00').split(':').map(Number);
  const h = date.getHours(), m = date.getMinutes();
  const minutes = h*60 + m;
  const start = qsH*60 + qsM;
  const end = qeH*60 + qeM;
  if (start < end) return minutes >= start && minutes < end; // same day
  return minutes >= start || minutes < end; // overnight
}
function backoffSchedule() {
  // simple schedule in hours: now, +24h, +72h, +120h (max 4)
  return [0, 24, 72, 120];
}

// --- API ---
app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/windows', (req, res) => {
  const { period_id, starts_at, ends_at } = req.body;
  if (!period_id || !starts_at || !ends_at) return res.status(400).json({ error: 'period_id, starts_at, ends_at required' });
  db.window = { period_id, starts_at: new Date(starts_at), ends_at: new Date(ends_at) };
  res.json({ ok: true, window: db.window });
});

app.post('/students/import', (req, res) => {
  const students = req.body?.students || [];
  for (const s of students) {
    const id = s.id || uuidv4();
    db.students.set(id, {
      id,
      name: s.name,
      phone: s.phone,
      email: s.email,
      saiiut_id: s.saiiut_id || id,
      status: 'PENDING',
      attempts: 0,
      nextAttemptAt: null,
      optout: false
    });
  }
  res.json({ ok: true, count: students.length });
});

app.get('/students', (req, res) => {
  const status = req.query.status;
  const arr = [...db.students.values()].filter(s => !status || s.status.toLowerCase() === String(status).toLowerCase());
  res.json(arr);
});

app.post('/students/:id/optout', (req, res) => {
  const s = db.students.get(req.params.id);
  if (!s) return res.status(404).json({ error: 'not found' });
  s.optout = true;
  res.json({ ok: true });
});

app.get('/attempts', (req, res) => {
  const sid = req.query.student_id;
  const arr = db.attempts.filter(a => !sid || a.student_id === sid);
  res.json(arr);
});

app.post('/campaigns/pause', (_req, res) => {
  db.paused = true;
  res.json({ ok: true, paused: db.paused });
});

app.post('/campaigns/run', async (_req, res) => {
  db.paused = false;
  scheduleBatch();
  res.json({ ok: true, scheduled: true });
});

// --- Core logic ---
async function pollAndSend() {
  if (db.paused) return;
  if (!db.window) return;
  const nowDate = now();
  if (withinQuietHours(nowDate)) return;
  if (nowDate < db.window.starts_at || nowDate > db.window.ends_at) return;

  for (const s of db.students.values()) {
    if (s.optout || s.status !== 'PENDING') continue;
    // Check SAIIUT first
    try {
      const { data } = await axios.get(`${SAIIUT_BASE}/status`, { params: { student_id: s.saiiut_id } });
      if (data?.validation_status === 'VALIDATED') {
        s.status = 'VALIDATED';
        continue;
      }
    } catch (e) {
      // ignore SAIIUT errors in demo
    }

    // Respect backoff
    const schedule = backoffSchedule();
    if (s.attempts >= schedule.length) continue;
    const dueHours = schedule[s.attempts];
    if (s.nextAttemptAt && nowDate < s.nextAttemptAt) continue;

    await sendWhatsApp(s);
    s.attempts += 1;
    const nextHours = schedule[s.attempts] || null;
    s.nextAttemptAt = nextHours ? new Date(nowDate.getTime() + nextHours*3600*1000) : null;
  }
}

async function sendWhatsApp(student) {
  const id = uuidv4();
  const text = `Hola ${student.name}, recuerda validar tus datos en SAIIUT antes del cierre del periodo. Gracias.`;
  // Mock sending
  console.log('[WHATSAPP] to:', student.phone, 'msg:', text);
  db.attempts.push({
    id, student_id: student.id, channel: 'whatsapp', attempt_no: student.attempts+1,
    sent_at: new Date().toISOString(), status: 'SENT'
  });
}

// schedule: run every minute (demo)
cron.schedule('* * * * *', () => {
  pollAndSend();
});

function scheduleBatch() {
  // immediate attempt once when run is called
  pollAndSend();
}

app.listen(PORT, () => {
  console.log(`reminders-service listening on http://localhost:${PORT}`);
});
