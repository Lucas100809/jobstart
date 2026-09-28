const express = require("express");
const usuario = protegerPagina("empresa");

if (usuario) {
    // código atual do painel da empresa
}

const router = express.Router();
const db = require("../database");

// CADASTRAR EMPRESA
router.post("/empresas", (req, res) => {
    const {
        usuario_id,
        nome,
        descricao,
        cidade,
        estado
    } = req.body;

    if (!usuario_id || !nome || !cidade || !estado) {
        return res.status(400).json({
            erro: "Preencha todos os campos obrigatórios"
        });
    }

    const sql = `
        INSERT INTO empresas (
            usuario_id,
            nome,
            descricao,
            cidade,
            estado
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            usuario_id,
            nome,
            descricao || null,
            cidade,
            estado
        ],
        function (err) {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro: "Erro ao cadastrar empresa"
                });
            }

            res.status(201).json({
                mensagem: "Empresa cadastrada com sucesso!",
                empresa: {
                    id: this.lastID,
                    usuario_id,
                    nome,
                    descricao,
                    cidade,
                    estado
                }
            });
        }
    );
});

// LISTAR EMPRESAS
router.get("/empresas", (req, res) => {
    const sql = `
        SELECT
            id,
            usuario_id,
            nome,
            descricao,
            cidade,
            estado
        FROM empresas
        ORDER BY nome
    `;

    db.all(sql, [], (err, empresas) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                erro: "Erro ao buscar empresas"
            });
        }

        res.json(empresas);
    });
});

// BUSCAR EMPRESA PELO USUÁRIO
router.get("/empresas/usuario/:usuario_id", (req, res) => {
    const { usuario_id } = req.params;

    const sql = `
        SELECT
            id,
            usuario_id,
            nome,
            descricao,
            cidade,
            estado
        FROM empresas
        WHERE usuario_id = ?
    `;

    db.get(sql, [usuario_id], (err, empresa) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                erro: "Erro ao buscar empresa"
            });
        }

        if (!empresa) {
            return res.status(404).json({
                erro: "Empresa não encontrada"
            });
        }

        res.json(empresa);
    });
});

module.exports = router;

