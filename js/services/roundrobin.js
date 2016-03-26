/**
 * Created by Gabriel on 09/03/2016.
 */

so.factory('RoundRobinService', function ($interval, $rootScope, CommonFunctionsService) {
    var roundrobin = {};

    roundrobin.availableProcessors = [];

    var ultimaFila = 0;
    var cmService = CommonFunctionsService;

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
            var quantum = CommonFunctionsService.config.quantum;

            //Caso hajam processadores disponiveis
            if (currentProcessor) {
                apto = roundrobin.aptos[apto.prioridade].shift();
                var processador = config.processadores[currentProcessor.id];

                var pct;

                processador.estado = 'Executando';
                processador.processo = apto;

                // Quantum aleatorio de acordo com a prioridade
                // Porem a fila 0 tem maior prioridade
                processador.tempo = parseInt(quantum) + (3 - apto.prioridade);

                if (processador.decreaseTime) {
                    $interval.cancel(processador.decreaseTime);
                }
                apto.state = 'Executando';
                cmService.increaseProcessorUsage(processador);
                processador.decreaseTime = $interval(function () {
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
                        }
                        cmService.decreaseProcessorUsage(processador);
                        $rootScope.$broadcast('BuscarProximo');
                    }
                    $rootScope.$broadcast('aptoMudou', {'apto': apto});
                }, 1000);
            }
        }

    };

    $rootScope.$on('BuscarProximo', function () {
        if (roundrobin.config.running) {
            execFunction(roundrobin.config);
        }
    });

    /**
     * Configura o servico
     * @param config
     * @param aptos
     */
    roundrobin.configurar = function () {
        roundrobin.aptos = [[], [], [], []];
        roundrobin.config = CommonFunctionsService.config;
        roundrobin.availableProcessors = angular.copy(roundrobin.config.processadores);
        cmService.headers = ['PID', 'Processo', 'Progresso', 'Estado', 'Prioridade', 'ETC(s)'];

        ultimaFila = 0;
    };

    /**
     * Executa o processo todo
     */
    roundrobin.executar = function () {
        roundrobin.criaProcessos();
        roundrobin.config.processadores.forEach(function () {
            $rootScope.$broadcast('BuscarProximo');
        });
    };

    roundrobin.criaProcessos = function () {
        CommonFunctionsService.processos.length = 0;
        roundrobin.aptos = [[], [], [], []];
        var i;

        for (i = 0; i < parseInt(CommonFunctionsService.config.processos); i++) {
            roundrobin.criarProcesso(false);
        }
    };

    /**
     *Cria processo especifico para o Round Robin
     */
    roundrobin.criarProcesso = function (active) {
        var prioridade = container.random(0, 3);

        var pid = CommonFunctionsService.processos.length;
        var proc = {
            pid: pid,
            processo: "Processo " + pid,
            progress: 0,
            state: 'Pronto',
            prioridade: prioridade,
            tempo: 0,
            tempoTotal: container.random(4, 20),
            active: active
        };

        roundrobin.aptos[prioridade].push(proc);
        CommonFunctionsService.processos.push(proc);
        $rootScope.$broadcast('aptoMudou', {'apto': proc, 'lastState': '-success'});
        $rootScope.$broadcast('BuscarProximo', {'apto': proc});
    };

    return roundrobin;
});