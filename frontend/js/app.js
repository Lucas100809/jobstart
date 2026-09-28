const API_URL = "http://localhost:3000/api";

/* =====================================================
   LOGIN
===================================================== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        const message = document.getElementById("loginMessage");

        message.textContent = "Entrando...";
        message.style.color = "#64748b";

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    senha
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.erro || "Erro ao realizar login"
                );
            }

            // Salva os dados do usuário
            localStorage.setItem(
                "jobstart_usuario",
                JSON.stringify(data.usuario)
            );

            message.textContent =
                "Login realizado com sucesso!";

            message.style.color = "#16a34a";

            setTimeout(() => {
                // Empresa vai para o painel da empresa
                if (data.usuario.tipo === "empresa") {
                    window.location.href = "empresa.html";
                    return;
                }

                // Candidato vai para as vagas
                window.location.href = "vagas.html";

            }, 800);

        } catch (error) {
            message.textContent = error.message;
            message.style.color = "#dc2626";
        }
    });
}


/* =====================================================
   LISTAR VAGAS
===================================================== */


/* =====================================================
   LISTAR E FILTRAR VAGAS
===================================================== */

const jobsContainer =
    document.getElementById("jobsContainer");

if (jobsContainer) {

    let todasAsVagas = [];


    async function carregarVagas() {

        try {

            const response =
                await fetch(`${API_URL}/vagas`);

            if (!response.ok) {
                throw new Error(
                    "Erro ao buscar vagas"
                );
            }

            todasAsVagas =
                await response.json();

            mostrarVagas(todasAsVagas);

        } catch (error) {

            console.error(error);

            jobsContainer.innerHTML = `
                <p>
                    Não foi possível carregar as vagas.
                    Verifique se o servidor está funcionando.
                </p>
            `;

            atualizarContador(0);
        }
    }


    function mostrarVagas(vagas) {

        jobsContainer.innerHTML = "";

        atualizarContador(vagas.length);


        if (vagas.length === 0) {

            jobsContainer.innerHTML = `
                <div class="empty-applications">

                    <h3>
                        Nenhuma vaga encontrada
                    </h3>

                    <p>
                        Tente alterar os filtros
                        ou pesquisar outro termo.
                    </p>

                </div>
            `;

            return;
        }


        vagas.forEach((vaga) => {

            const salario =
                vaga.salario
                    ? `R$ ${Number(vaga.salario)
                        .toFixed(2)
                        .replace(".", ",")}`
                    : "A combinar";


            const card =
                document.createElement("div");

            card.className =
                "job-card";


            card.innerHTML = `
                <h2>
                    ${vaga.titulo}
                </h2>

                <div class="job-company">
                    ${vaga.empresa}
                </div>

                <p class="job-description">
                    ${vaga.descricao}
                </p>

                <div class="job-info">

                    <span class="job-tag">
                        ${vaga.area}
                    </span>

                    <span class="job-tag">
                        📍 ${vaga.cidade}
                        -
                        ${vaga.estado}
                    </span>

                    <span class="job-tag">
                        ${vaga.modelo}
                    </span>

                </div>

                <div class="job-salary">
                    💰 ${salario}
                </div>

                <a
                    href="#"
                    class="job-button"
                    onclick="
                        candidatar(${vaga.id});
                        return false;
                    "
                >
                    Quero me candidatar
                </a>
            `;

            jobsContainer.appendChild(card);
        });
    }


    function aplicarFiltros() {

        const pesquisa =
            document
                .getElementById("searchInput")
                .value
                .toLowerCase()
                .trim();


        const area =
            document
                .getElementById("areaFilter")
                .value
                .toLowerCase();


        const cidade =
            document
                .getElementById("cityFilter")
                .value
                .toLowerCase()
                .trim();


        const modelo =
            document
                .getElementById("modelFilter")
                .value
                .toLowerCase();


        const vagasFiltradas =
            todasAsVagas.filter((vaga) => {

                const titulo =
                    vaga.titulo
                        .toLowerCase();

                const descricao =
                    vaga.descricao
                        .toLowerCase();

                const vagaArea =
                    vaga.area
                        .toLowerCase();

                const vagaCidade =
                    vaga.cidade
                        .toLowerCase();

                const vagaModelo =
                    vaga.modelo
                        .toLowerCase();


                const correspondePesquisa =
                    !pesquisa ||
                    titulo.includes(pesquisa) ||
                    descricao.includes(pesquisa);


                const correspondeArea =
                    !area ||
                    vagaArea === area;


                const correspondeCidade =
                    !cidade ||
                    vagaCidade.includes(cidade);


                const correspondeModelo =
                    !modelo ||
                    vagaModelo === modelo;


                return (
                    correspondePesquisa &&
                    correspondeArea &&
                    correspondeCidade &&
                    correspondeModelo
                );
            });


        mostrarVagas(vagasFiltradas);
    }


    function atualizarContador(quantidade) {

        const jobsCount =
            document.getElementById(
                "jobsCount"
            );

        if (!jobsCount) {
            return;
        }


        if (quantidade === 1) {

            jobsCount.textContent =
                "1 vaga encontrada";

        } else {

            jobsCount.textContent =
                `${quantidade} vagas encontradas`;
        }
    }


    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const areaFilter =
        document.getElementById(
            "areaFilter"
        );

    const cityFilter =
        document.getElementById(
            "cityFilter"
        );

    const modelFilter =
        document.getElementById(
            "modelFilter"
        );

    const clearFilters =
        document.getElementById(
            "clearFilters"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            aplicarFiltros
        );
    }


    if (areaFilter) {

        areaFilter.addEventListener(
            "change",
            aplicarFiltros
        );
    }


    if (cityFilter) {

        cityFilter.addEventListener(
            "input",
            aplicarFiltros
        );
    }


    if (modelFilter) {

        modelFilter.addEventListener(
            "change",
            aplicarFiltros
        );
    }


    if (clearFilters) {

        clearFilters.addEventListener(
            "click",
            () => {

                searchInput.value = "";
                areaFilter.value = "";
                cityFilter.value = "";
                modelFilter.value = "";

                mostrarVagas(todasAsVagas);
            }
        );
    }


    carregarVagas();
}




/* =====================================================
   CANDIDATAR-SE
===================================================== */

async function candidatar(vagaId) {

    const usuarioSalvo =
        localStorage.getItem("jobstart_usuario");

    if (!usuarioSalvo) {

        alert(
            "Você precisa entrar na sua conta para se candidatar."
        );

        window.location.href = "login.html";

        return;
    }

    const usuario =
        JSON.parse(usuarioSalvo);

    if (usuario.tipo !== "candidato") {

        alert(
            "Somente candidatos podem se candidatar às vagas."
        );

        return;
    }

    try {

        const response =
            await fetch(`${API_URL}/candidaturas`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    vaga_id: vagaId,
                    usuario_id: usuario.id
                })
            });

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.erro ||
                "Erro ao realizar candidatura."
            );

            return;
        }

        alert(
            "Candidatura realizada com sucesso! 🚀"
        );

    } catch (error) {

        console.error(error);

        alert(
            "Não foi possível realizar a candidatura. " +
            "Verifique se o servidor está funcionando."
        );
    }
}


/* =====================================================
   PAINEL DO CANDIDATO
===================================================== */

const applicationsContainer =
    document.getElementById("applicationsContainer");

if (applicationsContainer) {

    async function carregarCandidaturas() {

        const usuarioSalvo =
            localStorage.getItem("jobstart_usuario");

        if (!usuarioSalvo) {

            window.location.href = "login.html";

            return;
        }

        const usuario =
            JSON.parse(usuarioSalvo);

        if (usuario.tipo !== "candidato") {

            applicationsContainer.innerHTML = `
                <div class="empty-applications">

                    <h3>Acesso não permitido</h3>

                    <p>
                        Esta área é exclusiva para candidatos.
                    </p>

                </div>
            `;

            return;
        }

        const nomeUsuario =
            document.getElementById("nomeUsuario");

        if (nomeUsuario) {
            nomeUsuario.textContent =
                usuario.nome;
        }

        try {

            const response =
                await fetch(
                    `${API_URL}/candidaturas/usuario/${usuario.id}`
                );

            const candidaturas =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    candidaturas.erro ||
                    "Erro ao carregar candidaturas"
                );
            }

            if (candidaturas.length === 0) {

                applicationsContainer.innerHTML = `
                    <div class="empty-applications">

                        <h3>
                            Você ainda não possui candidaturas
                        </h3>

                        <p>
                            Encontre uma vaga e envie
                            sua primeira candidatura.
                        </p>

                        <a
                            href="vagas.html"
                            class="btn-primary"
                        >
                            Encontrar vagas
                        </a>

                    </div>
                `;

                return;
            }

            applicationsContainer.innerHTML = `
                <div class="application-list"></div>
            `;

            const applicationList =
                applicationsContainer.querySelector(
                    ".application-list"
                );

            candidaturas.forEach((candidatura) => {

                let statusClass =
                    "status-pendente";

                if (
                    candidatura.status ===
                    "Em análise"
                ) {
                    statusClass =
                        "status-analise";
                }

                if (
                    candidatura.status ===
                    "Aprovado"
                ) {
                    statusClass =
                        "status-aprovado";
                }

                if (
                    candidatura.status ===
                    "Recusado"
                ) {
                    statusClass =
                        "status-recusado";
                }

                const data =
                    new Date(
                        candidatura.criada_em
                    );

                const dataFormatada =
                    data.toLocaleDateString(
                        "pt-BR"
                    );

                const card =
                    document.createElement("div");

                card.className =
                    "application-card";

                card.innerHTML = `
                    <div>

                        <h3>
                            ${candidatura.titulo}
                        </h3>

                        <div class="application-company">
                            ${candidatura.empresa}
                        </div>

                        <div class="application-info">

                            <span class="application-tag">
                                ${candidatura.area}
                            </span>

                            <span class="application-tag">
                                📍 ${candidatura.cidade}
                                -
                                ${candidatura.estado}
                            </span>

                            <span class="application-tag">
                                ${candidatura.modelo}
                            </span>

                            <span class="application-tag">
                                📅 ${dataFormatada}
                            </span>

                        </div>

                    </div>

                    <div
                        class="status ${statusClass}"
                    >
                        ${candidatura.status}
                    </div>
                `;

                applicationList.appendChild(card);
            });

        } catch (error) {

            console.error(error);

            applicationsContainer.innerHTML = `
                <div class="empty-applications">

                    <h3>
                        Erro ao carregar candidaturas
                    </h3>

                    <p>
                        Verifique se o servidor está funcionando.
                    </p>

                </div>
            `;
        }
    }

    carregarCandidaturas();
}


/* =====================================================
   PAINEL DA EMPRESA
===================================================== */

const companyJobsContainer =
    document.getElementById(
        "companyJobsContainer"
    );

if (companyJobsContainer) {

    async function carregarVagasEmpresa() {

        const usuarioSalvo =
            localStorage.getItem(
                "jobstart_usuario"
            );

        if (!usuarioSalvo) {

            window.location.href =
                "login.html";

            return;
        }

        const usuario =
            JSON.parse(usuarioSalvo);

        if (usuario.tipo !== "empresa") {

            companyJobsContainer.innerHTML = `
                <div class="empty-applications">

                    <h3>
                        Acesso não permitido
                    </h3>

                    <p>
                        Esta área é exclusiva para empresas.
                    </p>

                </div>
            `;

            return;
        }

        const nomeEmpresa =
            document.getElementById(
                "nomeEmpresa"
            );

        if (nomeEmpresa) {

            nomeEmpresa.textContent =
                usuario.nome;
        }

        try {

            /* -----------------------------------------
               BUSCAR A EMPRESA DO USUÁRIO
            ----------------------------------------- */

            const empresaResponse =
                await fetch(
                    `${API_URL}/empresas/usuario/${usuario.id}`
                );

            const empresa =
                await empresaResponse.json();

            if (!empresaResponse.ok) {

                throw new Error(
                    empresa.erro ||
                    "Empresa não encontrada"
                );
            }


            /* -----------------------------------------
               BUSCAR SOMENTE AS VAGAS DA EMPRESA
            ----------------------------------------- */

            const vagasResponse =
                await fetch(
                    `${API_URL}/vagas/empresa/${empresa.id}`
                );

            const vagas =
                await vagasResponse.json();

            if (!vagasResponse.ok) {

                throw new Error(
                    vagas.erro ||
                    "Erro ao carregar vagas"
                );
            }


            /* -----------------------------------------
               NENHUMA VAGA
            ----------------------------------------- */

            if (vagas.length === 0) {

                companyJobsContainer.innerHTML = `
                    <div class="empty-applications">

                        <h3>
                            Nenhuma vaga cadastrada
                        </h3>

                        <p>
                            Publique sua primeira oportunidade.
                        </p>

                    </div>
                `;

                return;
            }


            /* -----------------------------------------
               LISTA DE VAGAS
            ----------------------------------------- */

            companyJobsContainer.innerHTML = `
                <div class="application-list"></div>
            `;

            const list =
                companyJobsContainer.querySelector(
                    ".application-list"
                );


            vagas.forEach((vaga) => {

                const salario =
                    vaga.salario
                        ? `R$ ${Number(vaga.salario)
                            .toFixed(2)
                            .replace(".", ",")}`
                        : "A combinar";


                const card =
                    document.createElement("div");

                card.className =
                    "application-card";


                card.innerHTML = `
                    <div>

                        <h3>
                            ${vaga.titulo}
                        </h3>

                        <div class="application-company">
                            ${vaga.empresa}
                        </div>

                        <div class="application-info">

                            <span class="application-tag">
                                ${vaga.area}
                            </span>

                            <span class="application-tag">
                                📍 ${vaga.cidade}
                                -
                                ${vaga.estado}
                            </span>

                            <span class="application-tag">
                                ${vaga.modelo}
                            </span>

                            <span class="application-tag">
                                💰 ${salario}
                            </span>

                        </div>

                    </div>

                    <a
                        href="#"
                        class="btn-primary"
                        onclick="
                            verCandidatos(${vaga.id});
                            return false;
                        "
                    >
                        Ver candidatos
                    </a>
                `;

                list.appendChild(card);
            });

        } catch (error) {

            console.error(error);

            companyJobsContainer.innerHTML = `
                <div class="empty-applications">

                    <h3>
                        Erro ao carregar vagas
                    </h3>

                    <p>
                        ${error.message}
                    </p>

                </div>
            `;
        }
    }

    carregarVagasEmpresa();
}


/* =====================================================
   VER CANDIDATOS
   Temporariamente preparado para a próxima etapa
===================================================== */

function verCandidatos(vagaId) {

    window.location.href =
        `candidatos.html?vaga=${vagaId}`;
}

/* =====================================================
   CANDIDATOS DE UMA VAGA
===================================================== */

const candidatesContainer =
    document.getElementById(
        "candidatesContainer"
    );

if (candidatesContainer) {

    async function carregarCandidatos() {

        const usuarioSalvo =
            localStorage.getItem(
                "jobstart_usuario"
            );

        if (!usuarioSalvo) {

            window.location.href =
                "login.html";

            return;
        }

        const usuario =
            JSON.parse(usuarioSalvo);

        if (usuario.tipo !== "empresa") {

            candidatesContainer.innerHTML = `
                <div class="empty-applications">

                    <h3>
                        Acesso não permitido
                    </h3>

                    <p>
                        Esta área é exclusiva para empresas.
                    </p>

                </div>
            `;

            return;
        }

        const parametros =
            new URLSearchParams(
                window.location.search
            );

        const vagaId =
            parametros.get("vaga");

        if (!vagaId) {

            candidatesContainer.innerHTML = `
                <div class="empty-applications">

                    <h3>
                        Vaga não informada
                    </h3>

                    <p>
                        Selecione uma vaga no painel da empresa.
                    </p>

                </div>
            `;

            return;
        }

        try {

            // Buscar informações da vaga
            const vagaResponse =
                await fetch(
                    `${API_URL}/vagas/${vagaId}`
                );

            const vaga =
                await vagaResponse.json();

            if (!vagaResponse.ok) {

                throw new Error(
                    vaga.erro ||
                    "Erro ao buscar vaga"
                );
            }

            const vagaTitulo =
                document.getElementById(
                    "vagaTitulo"
                );

            if (vagaTitulo) {

                vagaTitulo.textContent =
                    vaga.titulo;
            }


            // Buscar candidatos
            const response =
                await fetch(
                    `${API_URL}/candidaturas/vaga/${vagaId}`
                );

            const candidatos =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    candidatos.erro ||
                    "Erro ao buscar candidatos"
                );
            }


            if (candidatos.length === 0) {

                candidatesContainer.innerHTML = `
                    <div class="empty-applications">

                        <h3>
                            Nenhum candidato ainda
                        </h3>

                        <p>
                            Quando alguém se candidatar,
                            aparecerá aqui.
                        </p>

                    </div>
                `;

                return;
            }


            candidatesContainer.innerHTML = `
                <div class="application-list"></div>
            `;

            const list =
                candidatesContainer.querySelector(
                    ".application-list"
                );


            candidatos.forEach((candidato) => {

                const card =
                    document.createElement("div");

                card.className =
                    "application-card";


                card.innerHTML = `
                    <div>

                        <h3>
                            ${candidato.nome}
                        </h3>

                        <div class="application-company">
                            ${candidato.email}
                        </div>

                        <div class="application-info">

                            <span class="application-tag">
                                Candidato #${candidato.usuario_id}
                            </span>

                            <span class="application-tag">
                                📅 ${new Date(
                                    candidato.criada_em
                                ).toLocaleDateString("pt-BR")}
                            </span>

                        </div>

                    </div>


                    <div>

                        <label
                            for="status-${candidato.id}"
                        >
                            Status
                        </label>

                        <select
                            id="status-${candidato.id}"
                            class="status-select"
                            onchange="
                                alterarStatus(
                                    ${candidato.id},
                                    this.value
                                )
                            "
                        >

                            <option
                                value="Pendente"
                                ${candidato.status === "Pendente"
                                    ? "selected"
                                    : ""}
                            >
                                Pendente
                            </option>

                            <option
                                value="Em análise"
                                ${candidato.status === "Em análise"
                                    ? "selected"
                                    : ""}
                            >
                                Em análise
                            </option>

                            <option
                                value="Aprovado"
                                ${candidato.status === "Aprovado"
                                    ? "selected"
                                    : ""}
                            >
                                Aprovado
                            </option>

                            <option
                                value="Recusado"
                                ${candidato.status === "Recusado"
                                    ? "selected"
                                    : ""}
                            >
                                Recusado
                            </option>

                        </select>

                    </div>
                `;

                list.appendChild(card);

            });

        } catch (error) {

            console.error(error);

            candidatesContainer.innerHTML = `
                <div class="empty-applications">

                    <h3>
                        Erro ao carregar candidatos
                    </h3>

                    <p>
                        ${error.message}
                    </p>

                </div>
            `;
        }
    }

    carregarCandidatos();
}


/* =====================================================
   ALTERAR STATUS
===================================================== */

async function alterarStatus(
    candidaturaId,
    novoStatus
) {

    try {

        const response =
            await fetch(
                `${API_URL}/candidaturas/${candidaturaId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        status: novoStatus
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.erro ||
                "Erro ao atualizar status"
            );
        }

        alert(
            "Status atualizado com sucesso!"
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message
        );
    }
}


/* =====================================================
   CADASTRO
===================================================== */

const cadastroForm =
    document.getElementById("cadastroForm");

if (cadastroForm) {

    cadastroForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const nome =
                document.getElementById("nome").value;

            const email =
                document.getElementById("email").value;

            const senha =
                document.getElementById("senha").value;

            const tipo =
                document.getElementById("tipo").value;

            const message =
                document.getElementById(
                    "cadastroMessage"
                );


            message.textContent =
                "Criando conta...";

            message.style.color =
                "#64748b";


            try {

                const response =
                    await fetch(
                        `${API_URL}/usuarios`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                nome,
                                email,
                                senha,
                                tipo
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.erro ||
                        "Erro ao criar conta"
                    );
                }


                message.textContent =
                    "Conta criada com sucesso!";

                message.style.color =
                    "#16a34a";


                cadastroForm.reset();


                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1200);


            } catch (error) {

                console.error(error);

                message.textContent =
                    error.message;

                message.style.color =
                    "#dc2626";
            }

        }
    );
}


// =========================
// CADASTRAR NOVA VAGA
// =========================

const jobForm = document.getElementById("jobForm");

if (jobForm) {
    jobForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const usuario = JSON.parse(
            localStorage.getItem("jobstart_usuario")
        );

        const message = document.getElementById("jobMessage");

        if (!usuario) {
            message.innerHTML = `
                <p style="color: red;">
                    Você precisa estar logado para cadastrar uma vaga.
                </p>
            `;

            return;
        }

        if (usuario.tipo !== "empresa") {
            message.innerHTML = `
                <p style="color: red;">
                    Apenas empresas podem cadastrar vagas.
                </p>
            `;

            return;
        }

        try {
            // Busca a empresa vinculada ao usuário
            const empresaResponse = await fetch(
                `${API_URL}/empresas/usuario/${usuario.id}`
            );

            const empresa = await empresaResponse.json();

            if (!empresaResponse.ok) {
                throw new Error(
                    empresa.erro || "Empresa não encontrada"
                );
            }

            // Dados do formulário
            const vaga = {
                empresa_id: empresa.id,
                titulo: document.getElementById("titulo").value,
                descricao: document.getElementById("descricao").value,
                area: document.getElementById("area").value,
                cidade: document.getElementById("cidade").value,
                estado: document.getElementById("estado").value,
                salario:
                    document.getElementById("salario").value
                        ? Number(document.getElementById("salario").value)
                        : null,
                modelo: document.getElementById("modelo").value
            };

            // Envia para a API
            const response = await fetch(
                `${API_URL}/vagas`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(vaga)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.erro || "Erro ao cadastrar vaga"
                );
            }

            message.innerHTML = `
                <p style="color: green;">
                    Vaga publicada com sucesso!
                </p>
            `;

            // Limpa o formulário
            jobForm.reset();

            // Volta para o painel depois de 1 segundo
            setTimeout(() => {
                window.location.href = "empresa.html";
            }, 1000);

        } catch (error) {
            console.error(error);

            message.innerHTML = `
                <p style="color: red;">
                    ${error.message}
                </p>
            `;
        }
    });
}


// =========================
// AUTENTICAÇÃO E LOGOUT
// =========================

function obterUsuarioLogado() {
    const usuario = localStorage.getItem("jobstart_usuario");

    if (!usuario) {
        return null;
    }

    try {
        return JSON.parse(usuario);
    } catch (error) {
        localStorage.removeItem("jobstart_usuario");
        return null;
    }
}

function protegerPagina(tipoPermitido) {
    const usuario = obterUsuarioLogado();

    if (!usuario) {
        window.location.href = "login.html";
        return null;
    }

    if (usuario.tipo !== tipoPermitido) {
        if (usuario.tipo === "empresa") {
            window.location.href = "empresa.html";
        } else {
            window.location.href = "vagas.html";
        }

        return null;
    }

    return usuario;
}

function sair() {
    localStorage.removeItem("jobstart_usuario");
    window.location.href = "login.html";
}







