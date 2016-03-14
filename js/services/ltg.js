/**
 * Created by Gabriel on 12/03/2016.
 */
so.factory('LTGService', function ($rootScope, CommonFunctionsService, $interval) {

    $rootScope.$on('parar', function() {
        CommonFunctionsService.processos.length = 0;

    });

    return {
        config: CommonFunctionsService.config,
        aptos: [],
        tempos: [],
        processadores: [],
        cmService: CommonFunctionsService,
        buscarTempo: function () {
            //A ideia � que o tempo varie de acordo com a quantidade de cores
            var tempo = container.random(4, 20);
            //if (this.tempos[tempo]) {
            //    if (this.tempos[tempo] >= this.cmService.config.processos*5) {
            //        tempo = this.buscarTempo(tempo);
            //    } else {
            //        this.tempos[tempo] += 1;
            //        return tempo;
            //    }
            //} else {
            //    this.tempos[tempo] = 1;
            //}
            return tempo;
        },
        configurar: function (args) {
            //Altera a 4a coluna dos headers
            this.cmService.headers.splice(4, 1, 'Deadline');
            processadores = angular.copy(this.cmService.config.processadores);
        },
        criarProcesso: function (active) {
            var pid = this.cmService.processos.length;
            var buscarTempo = this.buscarTempo();
            var tempo = buscarTempo;
            var data = new Date();
            data.setSeconds(data.getSeconds() + buscarTempo);

            var proc = {
                pid: pid,
                processo: "Processo " + pid,
                progress: 0,
                state: 'Pronto',
                horaExecucao: data,
                active: active,
                tempoTotal: tempo,
                tempo: 0
            }

            this.aptos.push(proc);

            //Ordena os elementos
            this.cmService.insertionSort(this.aptos);
            this.cmService.processos.push(proc);
            this.cmService.insertionSort(this.cmService.processos);

            this.executarProcesso(proc);
            $rootScope.$broadcast('aptoMudou', {'apto': proc, 'lastState': '-success'});
        },
        getHoraExecucao: function (processo) {
            var data = new Date();
            var horaExc = this.cmService.formatHours(processo.horaExecucao).split(':');
            data.setHours(horaExc[0]);
            data.setMinutes(horaExc[1]);
            data.setSeconds(horaExc[2]);

            return data;
        },
        executarProcesso: function (processo) {
            var aptos = this.aptos;
            var cmService = this.cmService;

            var interval = function (execFunction) {
                var processador = this.processadores.shift();
                if (!processador && processo.tempoTotal - processo.tempo > 0) {
                    processo.tempo += 1;
                }
                else {
                    $interval.cancel(execFunction);

                    if (processador) {
                        processador = cmService.config.processadores[processador.id];
                        var index = aptos.indexOf(processo);
                        aptos.splice(index, 1)
                        processador.processo = processo;
                        processo.executado = 0;
                        processo.state = 'Executando';
                        processador.decreaseTime = $interval(function () {
                            if (cmService.config.running) {
                                processo.executado += container.random(2, 5);
                                var pct = processo.executado;

                                if (pct >= 100) {
                                    $interval.cancel(processador.decreaseTime);
                                    $interval.cancel(execFunction);
                                    processo.progress = 100;
                                    processador.processo = undefined;
                                    processo.state = 'Concluido';
                                    this.processadores.splice(processador.id, 0, processador);
                                    $rootScope.$broadcast('aptoMudou', {'apto': processo});
                                } else {
                                    processo.progress = pct;
                                }
                            } else {
                                $interval.cancel(processador.decreaseTime);
                            }
                        }, 500);
                    } else {
                        processo.state = 'Abortado';
                        $interval.cancel(execFunction);
                        aptos.splice(aptos.indexOf(processo), 1);
                    }
                    $rootScope.$broadcast('aptoMudou', {'apto': processo});
                }
            };
            var execFunction = $interval(function () {
                if (!CommonFunctionsService.config.running) {
                    $interval.cancel(execFunction);
                    return;
                }
                interval(execFunction)
            }, 1000);
        },
        criaProcessos: function () {
            this.cmService.processos.length = 0;
            this.aptos.length = 0;
            var i;

            for (i = 0; i < parseInt(this.cmService.config.processos); i++) {
                this.criarProcesso(false);
            }
        },
        executar: function () {
            this.criaProcessos();
        }
    }
});