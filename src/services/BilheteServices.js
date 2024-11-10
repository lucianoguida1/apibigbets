const Services = require('./Services.js');
const { Bilhete } = require('../database/models');


const JogoServices = require('./JogoServices.js');
const jogoServices = new JogoServices();



class BilheteServices extends Services {
    constructor() {
        super('Bilhete');
    }

    async montaBilhetes(estrategia, novosJogos = false) {
        // Verifica se a estratégia foi passada
        if (!estrategia) {
            throw new Error('Estratégia não encontrada!');
        }

        // Obtém as regras associadas à estratégia
        const regras = await estrategia.getRegras();
        if (!regras || regras.length === 0) {
            throw new Error('Estratégia não contém regras!');
        }
        const jogosUnicos = await jogoServices.filtrarJogosUnicos(regras, novosJogos);
        if (jogosUnicos.length === 0) {
            return ('Nenhum jogo encontrado!');
        }
        if (jogosUnicos.length <= regras.length) {
            return ('Quantidade de jogos insuficiente!');
        }

        try {
            let apostas = {};
            const bilhetesCriar = [];
            let i = await Bilhete.max('bilhete_id') || 1;

            const jogosArray = Object.values(jogosUnicos).sort((a, b) => new Date(b.datahora) - new Date(a.datahora));

            for (const jogo of jogosArray) {
                if (!apostas[i]) {
                    apostas[i] = { odd: 1, status: true, jogos: [] };
                }
                bilhetesCriar.push({
                    bilhete_id: i,
                    jogo_id: jogo.id,
                    estrategia_id: estrategia.id,
                    odd_id: jogo.odd_id,
                    status_jogo: jogo.statusOdd
                });

                apostas[i].jogos.push(jogo);
                apostas[i].odd *= jogo.odd;

                if (apostas[i].jogos.length >= regras.length || jogo === jogosArray.at(-1)) {
                    apostas[i].status = apostas[i].jogos.every((j) => j.statusOdd === true);
                    bilhetesCriar.forEach(bilhete => {
                        if (bilhete.bilhete_id === i) {
                            bilhete.status_bilhete = apostas[i].status;
                            bilhete.odd = apostas[i].odd.toFixed(2);
                            bilhete.data = jogo.data;
                        }
                    });
                    i++;
                }
            }
            const bilhetes = await this.criaVariosRegistros(bilhetesCriar)
            if (bilhetes) {
                return bilhetes;
            }
            throw new Error('Algo deu errado ao criar os bilhetes.');
        } catch (error) {
            console.error('BilhetesServices:', error.message);
        }
    }


}

module.exports = BilheteServices;
