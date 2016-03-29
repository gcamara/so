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
        this.config.aptos = [];
        this.cmService.headers = ['PID', 'Processo', 'Progresso', 'Estado', 'Intervalo', 'ETC(s)'];
        this.processadores = this.config.processadores;

        this.processadores.forEach(function (processador) {
            processador.aptos = [];
        });
    }

    function Processo() {
        this.startTime = 0;
        this.endTime = 0;
        this.pid = 0;
        this.tempo = 0;
        this.tempoTotal = 0;
        this.processo = '';
        this.executado = 0;
        this.active = false;

        Processo.prototype.toString = function () {
            return "Processo " + this.pid;
        }
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

        // lista.sort(function (procA, procB) { return procB.startTime - procA.startTime; });
        lista.sort();

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
        // Pega a lista de aptos do processador 0
        var lista = [].concat(interval.processadores[0].aptos);
        interval.processadores[0].aptos.length = 0;

        //Concatena com o que restou da ultima iteracao
        lista.concat(interval.remainder);

        //Agenda e gera um resto
        lista = interval.schedule(lista);

        //Atribui as listas para os processadores
        var i = 0;
        interval.processadores.forEach(function (processador) {
            if (i > 0) {
                processador.aptos = processador.aptos.concat(interval.remainder);
                console.log("Lista de aptos processador " + processador.id + ": " + processador.aptos);
                lista = interval.schedule(processador.aptos);
            }
            processador.aptos = lista;
            console.log("Foi atribuido para o proc: " + processador.id + " a lista: " + lista);

            i += 1;

            if (processador.aptos.length) {
                //Caso o processador ja esteja rodando
                if (!processador.execFunc) {
                    processador.execFunc = interval.createExecFunction(processador);
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
            if (data.getTime() > processo.endTime.getTime() && processo.state == 'Pronto') {
                processador.aptos.splice(processador.aptos.indexOf(processo), 1);
                return;
            }

            if (processador.processo) {
                return;
            }


            var horaAtualFormatada = interval.cmService.formatHours(data);
            var horaProcFormatada = interval.cmService.formatHours(processo.startTime);
            var horasStringIguais = horaAtualFormatada == horaProcFormatada;

            if (horasStringIguais && interval.notAllowedStates.indexOf(processo.state) == -1) {
                $interval.cancel(processador.execFunc);
                processo = processador.aptos.shift();
                processador.processo = processo;
                interval.cmService.increaseProcessorUsage(processador);
                processo.state = 'Executando';
                $rootScope.$broadcast('aptoMudou', {apto: processo});

                processador.decreaseTime = $interval(function () {
                    processo.executado += container.random(2, 5);
                    processo.progress = processo.executado;

                    if (processo.executado >= 100) {
                        processo.executado = 100;
                        processo.progress = 100;

                        processo.state = 'Concluido';
                        processador.processo = undefined;
                        $interval.cancel(processador.decreaseTime);
                        interval.cmService.decreaseProcessorUsage(processador);
                        $rootScope.$broadcast('aptoMudou', {apto: processo});
                        $rootScope.$broadcast('ProcessoTerminou', {processador: processador});
                    } else if (processo.executado < 20) {
                        $rootScope.$broadcast('aptoMudou', {apto: processo});
                    }
                }, 1000);
            }
        } else {
            if (processador.aptos[1]) {
                console.log("Processo indefinido... removendo de aptos do processador " + processador.id);
                processador.aptos.splice(0, 1);
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
        time.setSeconds(time.getSeconds() + container.random(5, 10));
        var timeChanged = new Date();
        timeChanged.setSeconds(timeChanged.getSeconds() + container.random(11, 15));

        var i = interval.cmService.processos.length;
        var tempoTotal = timeChanged.getTime() - new Date().getTime();
        tempoTotal /= 1000;

        var processo = new Processo();
        processo.startTime = time;
        processo.endTime = timeChanged;
        processo.processo = 'Processo ' + i;
        processo.pid = i;
        processo.state = 'Pronto';
        processo.tempoTotal = tempoTotal;
        processo.active = active;

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
            if (data.getTime() > processo.endTime.getTime() && processo.state == 'Pronto') {
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
    }


    return interval;
})