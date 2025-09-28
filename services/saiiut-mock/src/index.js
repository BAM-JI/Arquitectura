import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4001;

// In-memory status table
const status = new Map(); // student_id -> "PENDING"|"VALIDATED"

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/status', (req, res) => {
  const id = String(req.query.student_id || '');
  const st = status.get(id) || 'PENDING';
  res.json({ student_id: id, validation_status: st });
});

app.post('/admin/validate/:id', (req, res) => {
  const id = req.params.id;
  status.set(id, 'VALIDATED');
  res.json({ ok: true, student_id: id, validation_status: 'VALIDATED' });
});

app.listen(PORT, () => {
  console.log(`saiiut-mock listening on http://localhost:${PORT}`);
});
