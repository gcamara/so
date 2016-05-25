/**
 * Created by Gabriel on 12/03/2016.
 */
(function() {
    so.factory('LTGService', ['$rootScope', 'CommonFunctionsService', '$interval', 'LogService', LTGService]);

    function LTGService($rootScope, service, $interval, logger) {
        const NAME = "LTG";
        var self = this;

        $rootScope.$on('parar', function () {
            service.processos.length = 0;
            self.configurar();
        });

        this.config = service.config;
        this.aptos = [];
        this.processos = 0;
        this.processadores = [];

        this.buscarTempo = function () {
            return container.random(4, 20);
        };

        this.configurar = function () {
            service.headers = ['PID', 'Processo', 'Progresso', 'Estado', 'Deadline', 'ETC(s)'];

            //Restar propriedades
            aptos = [];
            processos = 0;
            processadores = [];

            processadores = angular.copy(this.config.processadores);
            self.processos = service.processos;
        }

        this.criarProcesso = function (active) {
            var memoriaProcesso = container.random(32, 1024);
            var pid = service.processos.length;
            var buscarTempo = this.buscarTempo();
            var tempo = buscarTempo;
            var data = new Date();
            data.setSeconds(data.getSeconds() + buscarTempo);

            //pid, horaExecucao, tempoTotal, active
            var proc = new Processo(pid, data, tempo, active);
            this.config.memoria.algoritmo.buscarMemoria(proc, memoriaProcesso);
            this.aptos.push(proc);
            logger.procInfo(NAME, 'Criado processo ' + proc.pid);

            //Ordena os elementos
            logger.procInfo(NAME, 'Ordenando elementos');
            service.insertionSort(this.aptos);
            this.processos.push(proc);
            service.insertionSort(this.processos);

            this.countDown(proc);
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

            var interval = function (execFunction) {
                var etc = processo.tempoTotal - processo.tempo > 0;

                if (processo.state == 'Executando') {
                    $interval.cancel(execFunction);
                    return;
                }

                if (etc) {
                    processo.tempo += 1;
                } else if (!etc && processo.state != 'Executando') {
                    self.abortaProcesso(processo, execFunction);
                }
            }

            var execFunction = $interval(function () {
                if (!service.config.running) {
                    $interval.cancel(execFunction);
                    return;
                }
                interval(execFunction)
            }, 1000);
        }

        this.abortaProcesso = function (processo, execFunction) {
            logger.procError(NAME, 'Abortando processo ' + processo.pid);
            processo.state = 'Abortado';
            $interval.cancel(execFunction)
            self.aptos.splice(self.aptos.indexOf(processo), 1);
            processo.limparBlocos(service);
            logger.memoryInfo(NAME, 'Limpando blocos do processo ' + processo.pid);
        }

        this.criaProcessos = function () {
            service.processos.length = 0;
            this.aptos.length = 0;
            var i;

            for (i = 0; i < parseInt(service.config.processos); i++) {
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
            processador.estado = 'Executando';

            service.increaseProcessorUsage(processador);
            processador.decreaseTime = $interval(function () {
                if (service.config.running) {
                    processo.executado += container.random(2, 5);
                    var pct = processo.executado;

                    if (pct >= 100) {
                        $interval.cancel(processador.decreaseTime);
                        processo.progress = 100;
                        processador.processo = undefined;
                        processo.state = 'Concluido';
                        processador.estado = 'Parado';
                        processo.limparBlocos(service);
                        this.processadores.splice(processador.id, 0, processador);
                        service.decreaseProcessorUsage(processador);
                        self.executarProximo();
                    } else {
                        processo.progress = pct;
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

        return self;
    }
})();