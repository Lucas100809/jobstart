const express = require("express");

const router = express.Router();
const db = require("../database");

// CADASTRO
router.post("/usuarios", (req, res) => {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha || !tipo) {
        return res.status(400).json({
            erro: "Preencha todos os campos"
        });
    }

    if (!["candidato", "empresa"].includes(tipo)) {
        return res.status(400).json({
            erro: "Tipo de usuário inválido"
        });
    }

    const sql = `
        INSERT INTO usuarios (nome, email, senha, tipo)
        VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [nome, email, senha, tipo], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.status(409).json({
                    erro: "Este e-mail já está cadastrado"
                });
            }

            console.error(err);

            return res.status(500).json({
                erro: "Erro ao cadastrar usuário"
            });
        }

        res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            usuario: {
                id: this.lastID,
                nome,
                email,
                tipo
            }
        });
    });
});

// LOGIN
router.post("/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            erro: "Informe e-mail e senha"
        });
    }

    const sql = `
        SELECT id, nome, email, senha, tipo
        FROM usuarios
        WHERE email = ?
    `;

    db.get(sql, [email], (err, usuario) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                erro: "Erro ao realizar login"
            });
        }

        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({
                erro: "E-mail ou senha incorretos"
            });
        }

        res.json({
            mensagem: "Login realizado com sucesso!",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            }
        });
    });
});

// LISTAR USUÁRIOS
router.get("/usuarios", (req, res) => {
    const sql = `
        SELECT id, nome, email, tipo, criado_em
        FROM usuarios
        ORDER BY id
    `;

    db.all(sql, [], (err, usuarios) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                erro: "Erro ao buscar usuários"
            });
        }

        res.json(usuarios);
    });
});

module.exports = router;