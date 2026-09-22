const express = require("express");
const session = require("express-session");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "troque-esta-senha";
const SESSION_SECRET = process.env.SESSION_SECRET || "troque-esta-chave";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false
});

async function inicializarBanco() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS respostas (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      acompanhantes INTEGER NOT NULL DEFAULT 0,
      resposta TEXT NOT NULL CHECK (resposta IN ('sim', 'nao')),
      criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("Banco de dados inicializado.");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

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

app.post("/api/confirmar", async (req, res) => {
  try {
    const nome = String(req.body.nome || "").trim();
    const resposta = req.body.resposta === "sim" ? "sim" : "nao";

    let acompanhantes = Number.parseInt(
      req.body.acompanhantes,
      10
    );

    if (!Number.isFinite(acompanhantes) || acompanhantes < 0) {
      acompanhantes = 0;
    }

    if (acompanhantes > 20) {
      acompanhantes = 20;
    }

    if (nome.length < 2 || nome.length > 120) {
      return res.status(400).json({
        erro: "Informe um nome válido."
      });
    }

    await pool.query(
      `
        INSERT INTO respostas (nome, acompanhantes, resposta)
        VALUES ($1, $2, $3)
      `,
      [nome, acompanhantes, resposta]
    );

    res.json({ ok: true });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      erro: "Não foi possível registrar a resposta."
    });
  }
});

function admin(req, res, next) {
  if (req.session.admin === true) {
    return next();
  }

  res.status(401).json({
    erro: "Não autorizado."
  });
}

app.post("/api/admin/login", (req, res) => {
  const user = String(req.body.usuario || "");
  const password = String(req.body.senha || "");

  if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
    req.session.admin = true;

    return res.json({
      ok: true
    });
  }

  res.status(401).json({
    erro: "Usuário ou senha incorretos."
  });
});

app.post("/api/admin/logout", admin, (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get("/api/admin/respostas", admin, async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT id, nome, acompanhantes, resposta, criado_em
      FROM respostas
      ORDER BY id DESC
    `);

    const rows = resultado.rows;

    const confirmados = rows.filter(
      (r) => r.resposta === "sim"
    );

    const recusas = rows.filter(
      (r) => r.resposta === "nao"
    );

    res.json({
      totalRespostas: rows.length,
      confirmados: confirmados.length,
      naoIrao: recusas.length,
      pessoasConfirmadas: confirmados.reduce(
        (total, r) => total + 1 + r.acompanhantes,
        0
      ),
      respostas: rows
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Não foi possível consultar as respostas."
    });
  }
});

app.delete("/api/admin/respostas/:id", admin, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM respostas WHERE id = $1",
      [req.params.id]
    );

    res.json({ ok: true });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Não foi possível excluir a resposta."
    });
  }
});

async function iniciar() {
  try {
    await inicializarBanco();

    app.listen(PORT, () => {
      console.log(`Convite disponível na porta ${PORT}`);
    });
  } catch (erro) {
    console.error("Erro ao iniciar o servidor:", erro);
    process.exit(1);
  }
}

iniciar();
