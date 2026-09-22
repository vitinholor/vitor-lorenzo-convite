const express = require("express");
const session = require("express-session");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "troque-esta-senha";
const SESSION_SECRET = process.env.SESSION_SECRET || "troque-esta-chave";

const dataDir = path.join(__dirname, "data");
require("fs").mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "presencas.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS respostas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    acompanhantes INTEGER NOT NULL DEFAULT 0,
    resposta TEXT NOT NULL CHECK(resposta IN ('sim','nao')),
    criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )
`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 1000 * 60 * 60 * 8 }
}));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/config", (req, res) => {
  res.json({
    nome: "Vitor Lorenzo",
    idade: 1,
    data: "27/12/2026",
    horario: "14:30",
    local: "Rua Barão do Rio Branco, 23, Pontal, Ilhéus - BA"
  });
});

app.post("/api/confirmar", (req, res) => {
  const nome = String(req.body.nome || "").trim();
  const resposta = req.body.resposta === "sim" ? "sim" : "nao";
  let acompanhantes = Number.parseInt(req.body.acompanhantes, 10);
  if (!Number.isFinite(acompanhantes) || acompanhantes < 0) acompanhantes = 0;
  if (acompanhantes > 20) acompanhantes = 20;

  if (nome.length < 2 || nome.length > 120) {
    return res.status(400).json({ erro: "Informe um nome válido." });
  }

  db.prepare(`
    INSERT INTO respostas (nome, acompanhantes, resposta)
    VALUES (?, ?, ?)
  `).run(nome, acompanhantes, resposta);

  res.json({ ok: true });
});

function admin(req, res, next) {
  if (req.session.admin === true) return next();
  res.status(401).json({ erro: "Não autorizado." });
}

app.post("/api/admin/login", (req, res) => {
  const user = String(req.body.usuario || "");
  const password = String(req.body.senha || "");
  if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
    req.session.admin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ erro: "Usuário ou senha incorretos." });
});

app.post("/api/admin/logout", admin, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/admin/respostas", admin, (req, res) => {
  const rows = db.prepare(`
    SELECT id, nome, acompanhantes, resposta, criado_em
    FROM respostas
    ORDER BY id DESC
  `).all();

  const confirmados = rows.filter(r => r.resposta === "sim");
  const recusas = rows.filter(r => r.resposta === "nao");

  res.json({
    totalRespostas: rows.length,
    confirmados: confirmados.length,
    naoIrao: recusas.length,
    pessoasConfirmadas: confirmados.reduce((s, r) => s + 1 + r.acompanhantes, 0),
    respostas: rows
  });
});

app.delete("/api/admin/respostas/:id", admin, (req, res) => {
  db.prepare("DELETE FROM respostas WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Convite disponível em http://localhost:${PORT}`);
});
