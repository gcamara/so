/**
 * Created by Gabriel on 05/03/2016.
 */
angular.module('so')
    .controller('TableController', function ($rootScope, $scope, $interval, AlgorithmExecuterService) {
        //Nao acessivel pela view
        var service;

        $scope.aptos = [[], [], [], []]
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

        $scope.addProccess = function () {
            service.criarProcesso($scope.processos());
        };

        $scope.filterNaoExecutando = function(processo) {
            return processo.prioridade === 0 && processo.state !== 'Executando';
        }

        var criaProcessos = function (service, processos) {
            $scope.processos().length = 0;
            $scope.aptos.length = 0;
            var i;

            for (i = 0; i < parseInt(processos); i++) {
                $scope.addProccess();
            }
        }

        $scope.$on('iniciar', function (events, args) {
            $scope.config = args;

            service = AlgorithmExecuterService.construirAlgoritmo('1');
            service.configurar(args);
            criaProcessos(service, args.processos);
            $scope.aptos = service.aptos;

            service.executar();
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