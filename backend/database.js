const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const databaseFolder = path.join(__dirname, "..", "database");

if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder, { recursive: true });
}

const databasePath = path.join(databaseFolder, "jobstart.db");

const db = new sqlite3.Database(databasePath, (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco:", err.message);
        return;
    }

    console.log("Banco de dados conectado!");

    db.run("PRAGMA foreign_keys = ON");

    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                senha TEXT NOT NULL,
                tipo TEXT NOT NULL CHECK(tipo IN ('candidato', 'empresa', 'admin')),
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS empresas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                nome TEXT NOT NULL,
                descricao TEXT,
                cidade TEXT NOT NULL,
                estado TEXT NOT NULL,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS vagas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                empresa_id INTEGER NOT NULL,
                titulo TEXT NOT NULL,
                descricao TEXT NOT NULL,
                area TEXT NOT NULL,
                cidade TEXT NOT NULL,
                estado TEXT NOT NULL,
                salario REAL,
                modelo TEXT NOT NULL,
                criada_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (empresa_id) REFERENCES empresas(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS candidaturas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vaga_id INTEGER NOT NULL,
                usuario_id INTEGER NOT NULL,
                status TEXT DEFAULT 'Pendente',
                criada_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (vaga_id) REFERENCES vagas(id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                UNIQUE(vaga_id, usuario_id)
            )
        `);
    });
});

module.exports = db;