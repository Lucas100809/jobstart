const express = require("express");
const cors = require("cors");


const db = require("./database");

const usuariosRoutes = require("./routes/usuarios");
const empresasRoutes = require("./routes/empresas");
const vagasRoutes = require("./routes/vagas");
const candidaturasRoutes = require("./routes/candidaturas");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/api", usuariosRoutes);
app.use("/api", empresasRoutes);
app.use("/api", vagasRoutes);
app.use("/api", candidaturasRoutes);


app.get("/", (req, res) => {
    res.json({
        projeto: "JobStart",
        mensagem: "API funcionando!"
    });
});



app.listen(PORT, () => {
    console.log(`JobStart rodando em http://localhost:${PORT}`);
});