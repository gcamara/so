/**
 * Created by Gabriel on 12/03/2016.
 */
so.factory('LTGService', function ($rootScope, CommonFunctionsService, $interval) {

    function LTGService() {
        var self = this;

        $rootScope.$on('parar', function () {
            CommonFunctionsService.processos.length = 0;
            self.configurar();
        });

        this.config = CommonFunctionsService.config;
        this.aptos = [];
        this.processos = 0;
        this.processadores = [];

        this.cmService = CommonFunctionsService;
        this.buscarTempo = function () {
            return container.random(4, 20);
        };

        this.configurar = function () {
            this.cmService.headers = ['PID', 'Processo', 'Progresso', 'Estado', 'Deadline', 'ETC(s)'];

            //Restar propriedades
            aptos = [];
            processos = 0;
            processadores = [];

            processadores = angular.copy(this.config.processadores);
            self.processos = self.cmService.processos;
        }

        this.criarProcesso = function (active) {
            var pid = this.cmService.processos.length;
            var buscarTempo = this.buscarTempo();
            var tempo = buscarTempo;
            var data = new Date();
            data.setSeconds(data.getSeconds() + buscarTempo);

            //pid, horaExecucao, tempoTotal, active
            var proc = new Processo(pid, data, tempo, active);

            this.aptos.push(proc);

            //Ordena os elementos
            this.cmService.insertionSort(this.aptos);
            this.processos.push(proc);
            this.cmService.insertionSort(this.processos);

            this.countDown(proc);

            console.log("processo: "+this.processos.indexOf(proc));
        }

        $rootScope.$watch(function () {
            return self.processos.length;
        }, function (newValue, oldValue) {
            if (oldValue) {
                if (newValue != oldValue) {
                    self.executarProximo();
                }
            }
        });

        this.countDown = function (processo) {
            var aptos = this.aptos;

            var interval = function (execFunction) {
                var etc = processo.tempoTotal - processo.tempo > 0;

                if (processo.state == 'Executando') {
                    $interval.cancel(execFunction);
                    return;
                }

                if (etc) {
                    processo.tempo += 1;
                } else if (!etc && processo.state != 'Executando') {
                    abortaProcesso(processo, execFunction, aptos);
                    $rootScope.$broadcast('aptoMudou', {'apto': processo, 'lastState': '-success'});
                }
            }

            var execFunction = $interval(function () {
                if (!CommonFunctionsService.config.running) {
                    $interval.cancel(execFunction);
                    return;
                }
                interval(execFunction)
            }, 1000);
        }

        var abortaProcesso = function (processo, execFunction, aptos) {
            processo.state = 'Abortado';
            $interval.cancel(execFunction)
            aptos.splice(aptos.indexOf(processo), 1);
        }

        this.criaProcessos = function () {
            this.cmService.processos.length = 0;
            this.aptos.length = 0;
            var i;

            for (i = 0; i < parseInt(this.cmService.config.processos); i++) {
                this.criarProcesso(false);
            }
        }

        this.iniciarProcessador = function (processo, processador) {
            processador = this.config.processadores[processador.id];

            if (processador.processo) {
                return;
            }

            processador.processo = processo;
            processo.executado = 0;
            processo.state = 'Executando';

            self.cmService.increaseProcessorUsage(processador);
            processador.decreaseTime = $interval(function () {
                if (self.cmService.config.running) {
                    processo.executado += container.random(2, 5);
                    var pct = processo.executado;

                    if (pct >= 100) {
                        $interval.cancel(processador.decreaseTime);
                        processo.progress = 100;
                        processador.processo = undefined;
                        processo.state = 'Concluido';
                        $rootScope.$broadcast('aptoMudou', {'apto': processo, 'lastState': '-info'});
                        this.processadores.splice(processador.id, 0, processador);
                        self.cmService.decreaseProcessorUsage(processador);
                        self.executarProximo();
                    } else {
                        processo.progress = pct;
                        if (pct < 20) {
                            $rootScope.$broadcast('aptoMudou', {'apto': processo});
                        }
                    }
                } else {
                    $interval.cancel(processador.decreaseTime);
                }
            }, 500);
        }

        self.executarProximo = function () {
            var processador = processadores.shift();
            if (!processador) {
                return;
            }
            var processo = self.aptos.shift();

            if (processo) {
                self.iniciarProcessador(processo, processador);
            } else {
                processadores.splice(processador.id, 0, processador);
            }
        }

        this.executarTodos = function () {
            angular.copy(self.aptos).forEach(function () {
                self.executarProximo();
            });
        }

        this.executar = function () {
            this.criaProcessos();
            this.executarTodos();
        }
    }

    return new LTGService();
})
;