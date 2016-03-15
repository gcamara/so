/**
 * Created by Gabriel on 11/03/2016.
 */
angular.module('so')
    .controller('TableController', function ($rootScope, $scope, $interval, AlgorithmExecuterService, CommonFunctionsService) {
        //Nao acessivel pela view
        var service;
        var cmService = CommonFunctionsService;

        $scope.headers = cmService.headers;
        $scope.config = cmService.config;
        $scope.aptos = [];

        $scope.processos = function () {
            return cmService.processos;
        };

        $scope.showPrioridades = function () {
            return cmService.config.algoritmo === '1';
        };

        $scope.collapseAptos = function () {
            $rootScope.$broadcast('collapseAptos');
        };

        $scope.addProccess = function (active) {
            service.criarProcesso(active, true);
        };

        $scope.filterNaoExecutando = function (processo, prioridade) {
            var estadosNaoPermitidos = ['Executando', 'Concluido'];
            return processo.prioridade === parseInt(prioridade) && estadosNaoPermitidos.indexOf(processo.state) < 0;
        };

        $scope.checkColumn4 = function (processo) {
            if ($scope.config.algoritmo === '1') {
                return processo.prioridade;
            }
            if ($scope.config.algoritmo === '2') {
                return cmService.formatHours(processo.horaExecucao);
            }
        };

        $scope.$on('iniciar', function () {
            service = AlgorithmExecuterService.construirAlgoritmo($scope.config.algoritmo);

            if (service) {
                service.configurar();
                cmService.aptos = service.aptos;
                $scope.aptos = cmService.aptos;

                service.executar();
            } else {
                alert('Algoritmo nao implementado');
                $scope.$parent.parar();
            }
        });

        $scope.$on('parar', function (events, args) {
            $scope.processos.length = 0;
        });
    });