/**
 * Created by Gabriel on 05/03/2016.
 */
angular.module('so')
    .controller('TableController', function ($rootScope, $scope, $interval, AlgorithmExecuterService) {
        //Nao acessivel pela view
        var service;

        $scope.aptos = [[], [], [], []]
        $scope.filaAptos;
        $scope.headers = ['PID', 'Processo', 'Progresso', 'Estado', 'Prioridade', 'ETC(s)'];
        $scope.procs = [];
        $scope.config;


        $scope.setWidth = function (row) {
            var width = row.progress + "%";
            return {width: width}
        };

        $scope.stateClass = function (row, type) {
            var clazz = "success";
            switch (row.state) {
                case 'Aguardando':
                    clazz = "warning";
                    break;
                case 'Executando':
                    clazz = "info active";
                    break;
            }

            return type + "-" + clazz;
        };

        $scope.processos = function () {
            return $scope.procs;
        }

        $scope.addProccess = function (active) {
            service.criarProcesso($scope.processos(), active);
        };

        $scope.filterNaoExecutando = function (processo, prioridade) {
            var estadosNaoPermitidos = ['Executando', 'Concluido'];
            return processo.prioridade === parseInt(prioridade) && estadosNaoPermitidos.indexOf(processo.state) < 0;
        }

        var criaProcessos = function (service, processos) {
            $scope.processos().length = 0;
            $scope.aptos.length = 0;
            var i;

            for (i = 0; i < parseInt(processos); i++) {
                $scope.addProccess(false);
            }
        }

        $scope.$on('iniciar', function (events, args) {
            $scope.config = args;

            service = AlgorithmExecuterService.construirAlgoritmo(args.algoritmo);

            if (service) {
                service.configurar(args);
                criaProcessos(service, args.processos);
                $scope.aptos = service.aptos;
                $scope.filaAptos = service.availableAptos;

                service.executar();
            } else {
                alert('Algoritmo nao implementado');
                args.processadores = [];
            }
        });

        $scope.$on('parar', function (events, args) {
            $scope.processos().length = 0;
        });
    }).
    controller('ConfigController', function ($rootScope, $scope) {

        $scope.config = {
            cores: 4,
            algoritmo: "1",
            quantum: 1,
            processos: 1,
            processadores: [],
            running: true
        };

        //Observa a quantidade de cores que deve estar num intervalo de 1 a 64
        $scope.$watch(
            function () {
                return $scope.config.cores
            },
            function (oldValue, newValue) {
                if (parseInt(oldValue) < 1) {
                    $scope.config.cores = 1;
                } else if (parseInt(oldValue) > 64) {
                    $scope.config.cores = 64;
                }
            });

        //Observa o quantum, que deve estar num intervalo de 2 a 20s
        $scope.$watch(
          function() {
              return $scope.config.quantum
          },
            function (oldValue, newValue) {
                if (parseInt(oldValue) < 2) {
                    $scope.config.quantum = 2;
                } else if (parseInt(oldValue) > 20) {
                    $scope.config.quantum = 20;
                }
            }
        );

        $scope.criarProcessadores = function () {
            console.log("Criando processadores...");
            $scope.config.processadores = [];
            var i;
            for (i = 0; i < parseInt($scope.config.cores); i++) {
                $scope.config.processadores.push({
                    id: i,
                    estado: 'Parado',
                    processo: {},
                    tempo: parseInt($scope.config.quantum)
                });
            }

            $scope.config.running = true;
            $rootScope.$broadcast('iniciar', $scope.config);
        }

        $scope.parar = function () {
            console.log("Parado");
            $scope.config.processadores = [];
            $scope.config.running = false;
            $rootScope.$broadcast('parar');
        }
    });