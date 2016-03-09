/**
 * Created by Gabriel on 09/03/2016.
 */

so.factory('RoundRobinService', function ($interval) {
    var roundrobin = {};

    roundrobin.availableProcessors = [];
    roundrobin.aptosCopy = [];
    roundrobin.aptos = undefined;

    var beforeStart = function (config) {
        roundrobin.availableProcessors = angular.copy(config.processadores);
        roundrobin.aptosCopy = angular.copy(roundrobin.aptos);
    };

    var execFunction = function (config, func) {
        if (roundrobin.availableProcessors) {
            //Busca os objetos originais para que possam ser alterados na View
            var currentProcessor = roundrobin.availableProcessors.shift();
            var quantum = roundrobin.quantum;

            //Caso hajam processadores disponiveis
            if (currentProcessor) {
                var processador = config.processadores[currentProcessor.id];

                var currentApto = roundrobin.aptosCopy.shift();
                var apto;

                //Enquanto houver aptos na fila de aptos
                if (currentApto) {
                    apto = roundrobin.aptos[currentApto.pid];
                    apto.prioridade = container.random(0, 3);
                }

                var pct;

                if (processador && apto) {
                    processador.estado = 'Executando';
                    processador.processo = apto;

                    // Quantum aleatorio de acordo com a prioridade
                    processador.tempo = parseInt(quantum) + apto.prioridade;

                    if (!processador.decreaseTime) {
                        processador.decreaseTime = $interval(function () {
                            if (processador.tempo && apto.tempo < apto.tempoTotal) {
                                if (processador.tempo - 1 > 0) {
                                    processador.tempo -= 1;
                                } else {
                                    processador.tempo = 0;
                                }

                                apto.state = 'Executando';
                                apto.tempo += 1;

                                pct = (apto.tempo / apto.tempoTotal) * 100;
                                apto.progress = pct;
                                console.log("Progresso: " + apto.progress);
                            } else {
                                $interval.cancel(processador.decreaseTime);
                                processador.estado = 'Parado';
                                processador.processo = undefined;
                                roundrobin.availableProcessors.push(currentProcessor);
                                processador.decreaseTime = undefined;
                                processador.tempo = 0;

                                //Caso ainda haja tempo, volta pra fila de aptos
                                if (apto.tempo < apto.tempoTotal) {
                                    apto.state = 'Aguardando';
                                    roundrobin.aptosCopy.push(currentApto);
                                } else {
                                    apto.progress = 100;
                                    apto.state = 'Concluido';
                                }
                            }
                        }, 1000);
                    }
                }
            } //Nao ha mais nada pra processar
            else {
                $interval.cancel(func);
            }
        }
    };

    roundrobin.executar = function (config, aptos) {
        roundrobin.aptos = aptos;
        roundrobin.quantum = config.quantum;
        beforeStart(config);
        var func;
        $interval(func = function () {
            execFunction(config, func)
        }, 500);
    };
    return roundrobin;
});