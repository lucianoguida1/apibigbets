const sql = require('mssql');
const ConsultaService = require('../services/ConsultaService');
const vm = require('vm');
const querystring = require('querystring');

const config = {
    //user: 'PLENA_SQL_MONITORIND',
    //password: 'B#BeF$@g6kGJTjdL%wi6',
    user: 'dbatak',
    password: 's@_@dmin!np@',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const databaseMapping = {
    'SQLTO': 'SATKPARAISO',
    'SQLPO': 'SATKPORANGATU',
    'SQLCO': 'SATKCONTAGEM',
    'SQLPM': 'SATKPARAMINAS'
};

const serverMapping = {
    'SQLTO': 'SQLTO.unifrigo.mg',
    'SQLPO': 'SQLPO.unifrigo.mg',
    'SQLCO': 'SQLCO.unifrigo.mg',
    'SQLPM': 'SQLPM.unifrigo.mg'
};

const descricaoBase = {
    'SQLTO': 'Paraíso do Tocantins',
    'SQLPO': 'Porangatu',
    'SQLCO': 'Contagem',
    'SQLPM': 'Para de Minas'
};

async function executeQueryOnServer(server, database, consultaSQL) {
    const dynamicConfig = {
        ...config,
        server: server,
        database: database
    };

    try {
        await sql.connect(dynamicConfig);
        const result = await sql.query(consultaSQL);
        return result;
    } finally {
        await sql.close();
    }
}

function substituteParams(query, params, queryParams) {
    params.forEach(param => {
        const { variavel, valor } = param;
        const queryValue = queryParams[variavel];
        query = query.replace(new RegExp(variavel, 'g'), queryValue || valor);
    });
    return query;
}

module.exports = {
    dados: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            let chave = req.params.chave;
            let consulta = await ConsultaService.buscarChave(chave);

            if (consulta) {
                const results = Array();

                // Parse the JSON string to an array
                const baseDeDadosList = JSON.parse(consulta.baseDeDados);

                // Parse the parameters JSON string to an array
                const parametrosList = JSON.parse(consulta.parametros);

                // Extract query parameters from the URL
                const queryParams = req.query;

                // Substitute parameters in the consulta
                const consultaSQL = substituteParams(consulta.consulta, parametrosList, queryParams);

                for (const baseDeDados of baseDeDadosList) {
                    const server = serverMapping[baseDeDados];
                    const database = databaseMapping[baseDeDados];
                    if (!server || !database) {
                        json.error = `Configuração não encontrada para a base de dados ${baseDeDados}!`;
                        res.json(json);
                        return;
                    }

                    try {
                        const result = await executeQueryOnServer(server, database, consultaSQL);
                        var dados = result.recordset;
                        for (const dado of result.recordset) {
                            dado.base = descricaoBase[baseDeDados];
                            results.push(dado);
                        }
                    } catch (error) {
                        json.error += ` - Erro ao executar consulta na base de dados ${baseDeDados}: ${error.message}`;
                    }
                }
                const sandbox = {
                    data: results,
                    console: console,
                    result: null
                };

                const script = new vm.Script(consulta.tratamento);
                const context = new vm.createContext(sandbox);

                try {
                    script.runInContext(context);
                    json.result = sandbox.result;
                    res.json(json);
                } catch (e) {
                    console.error('Erro ao executar código de tratamento:', e);
                    res.json({ error: 'Erro ao executar código de tratamento', details: e.message });
                }

            } else {
                json.error = "Chave da consulta não encontrada!";
                res.json(json);
            }

        } catch (error) {
            json.error = 'Erro ao executar consulta: ' + error.message;
            res.json(json);
        }
    }
}
