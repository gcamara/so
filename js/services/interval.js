/**
 * Created by Gabriel on 20/03/2016.
 */
so.factory('IntervalBasedService', function ($rootScope, CommonFunctionsService, $interval) {
    var interval = {};
    interval.cmService = CommonFunctionsService;
    interval.config = interval.cmService.config;
    interval.processos = interval.cmService.processos;
    interval.processadores = [];
    interval.remainder = [];

    var self = this;

    interval.configurar = function () {
        //Limpa os vetores
        interval.remainder = [];
        this.config.aptos = [];
        this.cmService.headers = ['PID', 'Processo', 'Progresso', 'Estado', 'Intervalo', 'ETC(s)'];
        this.processadores = this.config.processadores;

        this.processadores.forEach(function (processador) {
            processador.aptos = [];
        });
    }

    interval.criarProcessos = function () {
        interval.cmService.processos = [];
        for (var i = 0; i < interval.config.processos; i++) {
            interval.buildProcesso();
        }
    }

    interval.schedule = function (lista) {
        var last_end = new Date();
        last_end.setTime(0);

        var running = [];
        var remainder = [];

        //Reverte a lista
        lista.forEach(function (processo) {
            self.revert(processo);
        });

        lista.sort(function (procA, procB) { return procA.startTime - procB.startTime; });

        lista.forEach(function (processo) {
            if (processo.endTime.getTime() >= last_end.getTime()) {
                last_end = processo.startTime;
                self.revert(processo);
                running.push(processo);
            } else {
                self.revert(processo);
                remainder.push(processo);
            }

        });
        interval.remainder = remainder;
        return running;
    }

    self.revert = function (processo) {
        var aux = processo.endTime;
        processo.endTime = processo.startTime;
        processo.startTime = aux;
    }

    interval.executar = function () {
        interval.criarProcessos();
        interval.agendar();
    }

    interval.agendar = function () {
        var processadores = interval.processadores;
        var index = -1;
        // Pega a lista de aptos do processador 0
        var lista = [].concat(processadores[0].aptos);

        // Adiciona o processo em execucao tambem,
        // pois tem que contar o endtime dele
        if (processadores[0].processo) {
            lista.splice(0, 0, processadores[0].processo);
        }
        interval.processadores[0].aptos.length = 0;

        //Concatena com o que restou da ultima iteracao
        lista = lista.concat(interval.remainder);

        //Agenda e gera um resto
        lista = interval.schedule(lista);

        //Remove o que esta em execucao
        index = lista.indexOf(processadores[0].processo)
        if (index > -1) {
            lista.splice(index, 1);
        }

        //Atribui as listas para os processadores
        var i = 0;
        interval.processadores.forEach(function (processador) {
            if (i > 0) {
                lista = [];
                processador.aptos = processador.aptos.concat(interval.remainder);
                //Processo em execucao eh adicionado, pois tem que contar o endtime dele
                if (processador.processo) {
                    lista = lista.concat(processador.processo);
                }
                lista = lista.concat(processador.aptos);
                lista = interval.schedule(lista);

                index = lista.indexOf(processador.processo)
                if (index > -1) {
                    lista.splice(index, 1);
                }
            }
            processador.aptos = lista;

            i += 1;

            if (processador.aptos.length) {
                //Caso o processador nao esteja rodando
                if (!processador.execFunc) {
                    processador.execFunc = interval.createExecFunction(processador);
                    console.log("Iniciado processo para processador "+processador.id);
                }
            }
        });
    }

    interval.createExecFunction = function (processador) {
        return $interval(function () {
            if (!interval.config.running) {
                $interval.cancel(processador.execFunc);
            }
            interval.iniciarProcessador(processador);
        }, 1000);
    }

    interval.notAllowedStates = ['Executando', 'Abortado', 'Concluido'];

    interval.iniciarProcessador = function (processador) {
        var data = new Date();
        var processo = processador.aptos[0];
        if (processo) {
            //Se processador ja tiver processo, sai
            if (processador.processo) {
                return;
            }

            var horaAtualFormatada = interval.cmService.formatHours(data);
            var horaProcFormatada = interval.cmService.formatHours(processo.startTime);
            var horasStringIguais = horaAtualFormatada == horaProcFormatada;

            if (horasStringIguais && interval.notAllowedStates.indexOf(processo.state) == -1) {
                processo.tempoTotal = 0;
                processo.tempo = 0;
                
                $interval.cancel(processo.countDown);
                processo.state = 'Executando';
                $interval.cancel(processador.execFunc);
                processo = processador.aptos.shift();
                processador.processo = processo;
                interval.cmService.increaseProcessorUsage(processador);
                $rootScope.$broadcast('aptoMudou', {apto: processo});
                var executado = processo.endTime.getTime() - processo.startTime.getTime();
                executado /= 1000;
                executado  = Math.round(100/executado);
                console.log("Tempo por segundo: "+executado);

                processador.decreaseTime = $interval(function () {
                    processo.executado += executado;
                    processo.progress = processo.executado;

                    if (processo.executado >= 100) {
                        $rootScope.$broadcast('ProcessoTerminou', {processador: processador});
                        processo.executado = 100;
                        processo.progress = 100;

                        processo.state = 'Concluido';
                        processo.limparBlocos(interval.cmService);
                        processador.processo = undefined;
                        $interval.cancel(processador.decreaseTime);
                        interval.cmService.decreaseProcessorUsage(processador);
                        $rootScope.$broadcast('aptoMudou', {apto: processo});
                    } else if (processo.executado < 20) {
                        $rootScope.$broadcast('aptoMudou', {apto: processo});
                    }
                }, 1000);
            }
        }
    }

    $rootScope.$on('ProcessoTerminou', function (event, args) {
        args.processador.execFunc = interval.createExecFunction(args.processador);
    });


    interval.criarProcesso = function (active) {
        interval.buildProcesso(active);
        interval.agendar();
    }

    interval.buildProcesso = function (active) {
        var time = new Date();
        time.setSeconds(time.getSeconds() + container.random(2, 40));
        var timeChanged = new Date(time.getTime());
        timeChanged.setSeconds(timeChanged.getSeconds() + container.random(20, 30));

        var i = interval.cmService.processos.length;
        var tempoTotal = time.getTime() - new Date().getTime();
        tempoTotal /= 1000;

        //pid, horaExecucao, tempoTotal, active
        var processo = new Processo(i, undefined, tempoTotal, active);
        var memoriaProcesso = container.random(32, 1024);
        this.config.memoria.algoritmo.buscarMemoria(proc,memoriaProcesso);
        processo.startTime = time;
        processo.endTime = timeChanged;

        interval.cmService.processos.push(processo);
        interval.processadores[0].aptos.push(processo);
        interval.countDown(processo);
    }

    interval.countDown = function (processo) {
        var countTimer = $interval(function () {
            if (!interval.config.running || !processo) {
                $interval.cancel(countTimer);
                return;
            }
            var data = new Date();
            var processTime = angular.copy(processo.startTime);
            processTime.setSeconds(processTime.getSeconds() + 1);

            if (data.getTime() > processTime.getTime() && processo.state == 'Pronto') {
                processo.state = 'Abortado';
                $rootScope.$broadcast('aptoMudou', {apto: processo});
                interval.remainder.splice(interval.remainder.indexOf(processo), 1);
                processo.tempo = 0;
                processo.tempoTotal = 0;

                interval.processadores.forEach(function(proc) {
                    var index = proc.aptos.indexOf(processo);
                    if (index > -1) {
                        proc.aptos.splice(index, 1);
                    }
                });
                processo = undefined;
                $interval.cancel(countTimer);
            } else {
                if (processo.state == 'Executando') {
                    $interval.cancel(countTimer);
                    processo.tempo = 0;
                }
                processo.tempo += 1;
            }
        }, 1000);

        processo.countDown = countTimer;
    }


    return interval;
})