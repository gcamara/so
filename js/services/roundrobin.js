/**
 * Created by Gabriel on 09/03/2016.
 */

so.factory('RoundRobinService', ['$interval', '$rootScope', 'CommonFunctionsService', 'LogService', RoundRobin]);

function RoundRobin($interval, $rootScope, service, logger) {
    const NAME = 'Round Robin';
    var roundrobin = {};

    roundrobin.availableProcessors = [];

    var ultimaFila = 0;
    var memoria = service.config.memoria;

    $rootScope.$on('iniciar', function() {
        verificarExecucao();
    })

    /**
     * Busca o proximo apto
     * @returns {*}
     */
    var buscarProximoApto = function () {
        var apto;

        if (roundrobin.aptos) {
            if (ultimaFila < 4) {
                apto = roundrobin.aptos[ultimaFila][0];
                ultimaFila += 1;
                if (!apto && (roundrobin.aptos[0].length || roundrobin.aptos[1].length || roundrobin.aptos[2].length || roundrobin.aptos[3].length)) {
                    apto = buscarProximoApto();
                }
            } else if (ultimaFila >= 4) {
                ultimaFila = 0;
                apto = buscarProximoApto();
            }
        }
        return apto;
    };

    /**
     * Executa o processo
     * @param config
     * @param func
     */
    var execFunction = function (config) {
        var apto = buscarProximoApto();

        if (apto) {
            //Busca os objetos originais para que possam ser alterados na View
            var currentProcessor = roundrobin.availableProcessors.shift();
            var quantum = service.config.quantum;

            //Caso hajam processadores disponiveis
            if (currentProcessor) {
                apto = roundrobin.aptos[apto.prioridade].shift();
                var processador = config.processadores[currentProcessor.id];

                var pct;

                if (processador) {
                    logger.procInfo(NAME, 'Iniciando processo ' + apto.pid + ' no processador ' + processador.id);
                    processador.estado = 'Executando';
                    processador.processo = apto;

                    // Quantum aleatorio de acordo com a prioridade
                    // Porem a fila 0 tem maior prioridade
                    processador.tempo = parseInt(quantum) + (3 - apto.prioridade);

                    if (processador.decreaseTime) {
                        $interval.cancel(processador.decreaseTime);
                    }
                    apto.state = 'Executando';
                    try {
                        if (apto.chance) {
                            memoria.algoritmo.buscarMemoria(apto, container.random(32, 1024), true);
                        }

                        service.increaseProcessorUsage(processador);
                        processador.decreaseTime = $interval(function () {
                            if (!config.running) {
                                $interval.cancel(processador.decreaseTime);
                            }
                            var apto = processador.processo;
                            if (processador.tempo && apto.tempo < apto.tempoTotal) {
                                if (processador.tempo - 1 > 0) {
                                    processador.tempo -= 1;
                                } else {
                                    processador.tempo = 0;
                                }

                                apto.tempo += 1;
                                pct = (apto.tempo / apto.tempoTotal) * 100;
                                apto.progress = Math.floor(pct);
                            } else {
                                processador.estado = 'Parado';
                                logger.procInfo(NAME, 'Processador ' + processador.id + ' parou');
                                $interval.cancel(processador.decreaseTime);
                                processador.processo = undefined;
                                roundrobin.availableProcessors.splice(currentProcessor.id, 0, currentProcessor);
                                processador.tempo = 0;

                                //Caso ainda haja tempo, volta pra fila de aptos
                                if (apto.tempo < apto.tempoTotal) {
                                    apto.state = 'Aguardando';
                                    roundrobin.aptos[apto.prioridade].push(apto);
                                } else {
                                    apto.progress = 100;
                                    apto.state = 'Concluido';
                                    apto.limparBlocos(service);
                                }
                                service.decreaseProcessorUsage(processador);
                                buscarProximo();
                            }
                        }, 1000);
                    } catch (e) {
                        apto.state = 'Abortado';
                        processador.estado = 'Parado';
                        processador.processo = undefined;
                        processador.tempo = 0;
                        logger.procInfo(NAME, 'Retornando processador '+currentProcessor.id);
                        roundrobin.availableProcessors.splice(currentProcessor.id, 0, currentProcessor);
                        logger.procInfo(NAME, 'Indice do processador: '+roundrobin.availableProcessors.indexOf(currentProcessor));
                        service.decreaseProcessorUsage(processador);
                        processo.limparBlocos(service);
                        buscarProximo();
                    }
                }
            }
        }
    };

    var verificarExecucao = function() {
        var verificaProcesso = $interval(function() {
            if (roundrobin.config.running) execFunction(roundrobin.config);
            else $interval.cancel(verificaProcesso);
        }, 1000);
    };

    roundrobin.abortaProcesso = function (processo) {
        logger.procError(NAME, 'Abortando processo ' + processo.pid);
        processo.state = 'Abortado';
        logger.sysInfo('Acessou o abortar processo para processo '+processo.pid);
        for (var i = 0; i < 4; i++) {
            var listaAptos = roundrobin.aptos[i];
            var index = listaAptos.indexOf(processo);
            if (index > -1) {
                logger.sysInfo('Encontrou o processo na fila '+i+' indice '+index);
                listaAptos.splice(index, 1);
                break;
            }
        };
        processo.limparBlocos(service);
        logger.memoryInfo(NAME, 'Limpando blocos do processo ' + processo.pid);
        buscarProximo();
    }

    var buscarProximo = function() {
        if (roundrobin.config.running) {
            execFunction(roundrobin.config);
        }
    };

    /**
     * Configura o servico
     * @param config
     * @param aptos
     */
    roundrobin.configurar = function () {
        roundrobin.aptos = [[], [], [], []];
        roundrobin.config = service.config;
        roundrobin.availableProcessors = angular.copy(roundrobin.config.processadores);
        service.headers = ['PID', 'Processo', 'Progresso', 'Estado', 'Prioridade', 'ETC(s)'];

        ultimaFila = 0;
    };

    /**
     * Executa o processo todo
     */
    roundrobin.executar = function () {
        roundrobin.criaProcessos();
        roundrobin.config.processadores.forEach(function () {
            buscarProximo();
        });
    };

    roundrobin.criaProcessos = function () {
        service.processos.length = 0;
        roundrobin.aptos = [[], [], [], []];
        var i;

        for (i = 0; i < parseInt(service.config.processos); i++) {
            roundrobin.criarProcesso(false);
        }
    };

    /**
     *Cria processo especifico para o Round Robin
     */
    roundrobin.criarProcesso = function (active) {

        var prioridade = container.random(0, 3);

        var pid = service.processos.length;
        var tempoTotal = container.random(4, 20);

        //Construir Processo
        //pid, horaExecucao, tempoTotal, active
        var proc = new Processo(pid, undefined, tempoTotal, active);
        proc.prioridade = prioridade;

        roundrobin.aptos[prioridade].push(proc);
        service.processos.push(proc);

        //Verificar memória
        var memoriaProcesso = container.random(32, 1024);
        this.config.memoria.algoritmo.buscarMemoria(proc, memoriaProcesso);
        buscarProximo();
    };

    return roundrobin;
}