/**
 * Created by Gabriel on 05/03/2016.
 */
angular.module('so')
    .controller('TableController', function ($rootScope, $scope, $interval, AlgorithmExecuterService) {
        //Utilizado para representar esse objeto controller
        var ctrl = this;

        $scope.aptos = []
        $scope.headers = [ 'PID', 'Processo', 'Progresso', 'Estado', 'Prioridade', 'ETC(s)' ];

        $scope.setWidth = function (row) {
            var width = row.progress + "%";
            return {width: width}
        };

        $scope.stateClass = function(row, type) {
            var clazz = "success";
            switch (row.state) {
                case 'Aguardando':
                    clazz = "warning";
                    break;
                case 'Executando':
                    clazz = "info active";
                    break;
            }

            return type+"-"+clazz;
        };

        $scope.addProcess = function (processo) {
            var row = {
                pid: $scope.aptos.length,
                processo: processo,
                progress: 0,
                state: 'Running'
            };
            $scope.aptos.push(row);
        };

        var criaProcessos = function (processos) {
            $scope.aptos.length = 0;
            var i;
            for (i = 0; i < parseInt(processos); i++) {
                $scope.aptos.push({
                    pid: i,
                    processo: 'Processo ' + i,
                    progress: 0,
                    state: 'Executando',
                    tempo: 0,
                    tempoTotal: 10
                });
            }

        }

        $scope.$on('iniciar', function (events, args) {
            console.log("Evento escutado..");
            criaProcessos(args.processos);
            var service = AlgorithmExecuterService.construirAlgoritmo('1');
            service.executar(args, $scope.aptos);
        });

        $scope.$on('parar', function (events, args) {
            $scope.aptos = [];
        });
    }).controller('ConfigController', function ($rootScope, $scope) {
        $scope.config = {
            cores: 4,
            algoritmo: "1",
            quantum: 1,
            processos: 1,
            processadores: []
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

            $rootScope.$broadcast('iniciar', $scope.config);
        }

        $scope.parar = function () {
            console.log("Parado");
            $scope.config.processadores = [];
            $rootScope.$broadcast('parar');
        }
    });