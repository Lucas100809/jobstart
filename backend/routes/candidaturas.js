const express = require("express");
const usuario = protegerPagina("candidato");

if (usuario) {
    // código atual do painel do candidato
}

const router = express.Router();
const db = require("../database");

// CANDIDATAR-SE A UMA VAGA
router.post("/candidaturas", (req, res) => {
    const { vaga_id, usuario_id } = req.body;

    if (!vaga_id || !usuario_id) {
        return res.status(400).json({
            erro: "Informe a vaga e o usuário"
        });
    }

    // Verifica se o usuário existe e é candidato
    db.get(
        `SELECT id, nome, tipo FROM usuarios WHERE id = ?`,
        [usuario_id],
        (err, usuario) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    erro: "Erro ao verificar usuário"
                });
            }

            if (!usuario) {
                return res.status(404).json({
                    erro: "Usuário não encontrado"
                });
            }

            if (usuario.tipo !== "candidato") {
                return res.status(403).json({
                    erro: "Somente candidatos podem se candidatar"
                });
            }

            // Verifica se a vaga existe
            db.get(
                `SELECT id, titulo FROM vagas WHERE id = ?`,
                [vaga_id],
                (err, vaga) => {
                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            erro: "Erro ao verificar vaga"
                        });
                    }

                    if (!vaga) {
                        return res.status(404).json({
                            erro: "Vaga não encontrada"
                        });
                    }

                    // Cria a candidatura
                    const sql = `
                        INSERT INTO candidaturas (
                            vaga_id,
                            usuario_id
                        )
                        VALUES (?, ?)
                    `;

                    db.run(
                        sql,
                        [vaga_id, usuario_id],
                        function (err) {
                            if (err) {
                                if (
                                    err.message.includes(
                                        "UNIQUE constraint failed"
                                    )
                                ) {
                                    return res.status(409).json({
                                        erro: "Você já se candidatou a esta vaga"
                                    });
                                }

                                console.error(err);

                                return res.status(500).json({
                                    erro: "Erro ao realizar candidatura"
                                });
                            }

                            res.status(201).json({
                                mensagem: "Candidatura realizada com sucesso!",
                                candidatura: {
                                    id: this.lastID,
                                    vaga_id,
                                    usuario_id,
                                    status: "Pendente"
                                }
                            });
                        }
                    );
                }
            );
        }
    );
});

// LISTAR CANDIDATURAS DE UM CANDIDATO
router.get("/candidaturas/usuario/:usuario_id", (req, res) => {
    const { usuario_id } = req.params;

    const sql = `
        SELECT
            candidaturas.id,
            candidaturas.status,
            candidaturas.criada_em,
            vagas.id AS vaga_id,
            vagas.titulo,
            vagas.area,
            vagas.cidade,
            vagas.estado,
            vagas.modelo,
            empresas.nome AS empresa
        FROM candidaturas
        INNER JOIN vagas
            ON candidaturas.vaga_id = vagas.id
        INNER JOIN empresas
            ON vagas.empresa_id = empresas.id
        WHERE candidaturas.usuario_id = ?
        ORDER BY candidaturas.criada_em DESC
    `;

    db.all(sql, [usuario_id], (err, candidaturas) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                erro: "Erro ao buscar candidaturas"
            });
        }

        res.json(candidaturas);
    });
});

// LISTAR CANDIDATOS DE UMA VAGA
router.get("/candidaturas/vaga/:vaga_id", (req, res) => {
    const { vaga_id } = req.params;

    const sql = `
        SELECT
            candidaturas.id,
            candidaturas.status,
            candidaturas.criada_em,
            usuarios.id AS usuario_id,
            usuarios.nome,
            usuarios.email
        FROM candidaturas
        INNER JOIN usuarios
            ON candidaturas.usuario_id = usuarios.id
        WHERE candidaturas.vaga_id = ?
        ORDER BY candidaturas.criada_em DESC
    `;

    db.all(sql, [vaga_id], (err, candidatos) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                erro: "Erro ao buscar candidatos"
            });
        }

        res.json(candidatos);
    });
});

// ALTERAR STATUS DA CANDIDATURA
router.patch("/candidaturas/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const statusPermitidos = [
        "Pendente",
        "Em análise",
        "Aprovado",
        "Recusado"
    ];

    if (!statusPermitidos.includes(status)) {
        return res.status(400).json({
            erro: "Status inválido"
        });
    }

    const sql = `
        UPDATE candidaturas
        SET status = ?
        WHERE id = ?
    `;

    db.run(sql, [status, id], function (err) {
        if (err) {
            console.error(err);

            return res.status(500).json({
                erro: "Erro ao atualizar candidatura"
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                erro: "Candidatura não encontrada"
            });
        }

        res.json({
            mensagem: "Status atualizado com sucesso!",
            candidatura: {
                id: Number(id),
                status
            }
        });
    });
});

module.exports = router;