const express = require("express");

const router = express.Router();
const db = require("../database");

// CADASTRAR VAGA
router.post("/vagas", (req, res) => {
    const {
        empresa_id,
        titulo,
        descricao,
        area,
        cidade,
        estado,
        salario,
        modelo
    } = req.body;

    if (
        !empresa_id ||
        !titulo ||
        !descricao ||
        !area ||
        !cidade ||
        !estado ||
        !modelo
    ) {
        return res.status(400).json({
            erro: "Preencha todos os campos obrigatórios"
        });
    }

    const sql = `
        INSERT INTO vagas (
            empresa_id,
            titulo,
            descricao,
            area,
            cidade,
            estado,
            salario,
            modelo
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            empresa_id,
            titulo,
            descricao,
            area,
            cidade,
            estado,
            salario || null,
            modelo
        ],
        function (err) {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro: "Erro ao cadastrar vaga"
                });
            }

            res.status(201).json({
                mensagem: "Vaga cadastrada com sucesso!",
                vaga: {
                    id: this.lastID,
                    empresa_id,
                    titulo,
                    descricao,
                    area,
                    cidade,
                    estado,
                    salario,
                    modelo
                }
            });
        }
    );
});

// LISTAR TODAS AS VAGAS
router.get("/vagas", (req, res) => {
    const sql = `
        SELECT
            vagas.id,
            vagas.titulo,
            vagas.descricao,
            vagas.area,
            vagas.cidade,
            vagas.estado,
            vagas.salario,
            vagas.modelo,
            empresas.nome AS empresa
        FROM vagas
        INNER JOIN empresas
            ON vagas.empresa_id = empresas.id
        ORDER BY vagas.criada_em DESC
    `;

    db.all(sql, [], (err, vagas) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                erro: "Erro ao buscar vagas"
            });
        }

        res.json(vagas);
    });
});

// LISTAR VAGAS DE UMA EMPRESA
router.get("/vagas/empresa/:empresa_id", (req, res) => {
    const { empresa_id } = req.params;

    const sql = `
        SELECT
            vagas.id,
            vagas.titulo,
            vagas.descricao,
            vagas.area,
            vagas.cidade,
            vagas.estado,
            vagas.salario,
            vagas.modelo,
            empresas.nome AS empresa
        FROM vagas
        INNER JOIN empresas
            ON vagas.empresa_id = empresas.id
        WHERE vagas.empresa_id = ?
        ORDER BY vagas.criada_em DESC
    `;

    db.all(sql, [empresa_id], (err, vagas) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                erro: "Erro ao buscar vagas da empresa"
            });
        }

        res.json(vagas);
    });
});

// BUSCAR VAGA POR ID
router.get("/vagas/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            vagas.id,
            vagas.titulo,
            vagas.descricao,
            vagas.area,
            vagas.cidade,
            vagas.estado,
            vagas.salario,
            vagas.modelo,
            empresas.nome AS empresa
        FROM vagas
        INNER JOIN empresas
            ON vagas.empresa_id = empresas.id
        WHERE vagas.id = ?
    `;

    db.get(sql, [id], (err, vaga) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                erro: "Erro ao buscar vaga"
            });
        }

        if (!vaga) {
            return res.status(404).json({
                erro: "Vaga não encontrada"
            });
        }

        res.json(vaga);
    });
});

module.exports = router;

