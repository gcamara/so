/**
 * Created by Gabriel on 11/03/2016.
 */
angular.module('so')
    .controller('TableController', function ($rootScope, $scope, $interval, AlgorithmExecuterService, CommonFunctionsService) {
        const ROUND_ROBIN = '1';
        const LTG = '2';
        const INTERVAL = '3';

        //Nao acessivel pela view
        var service;
        var cmService = CommonFunctionsService;
        $scope.cmService = CommonFunctionsService;

        $scope.headers = cmService.headers;
        $scope.config = cmService.config;
        $scope.aptos = [];

        $scope.remainder = function() {
            if (service && service.remainder) {
                return service.remainder;
            } else {
                return [];
            }
        }

        $scope.processos = function () {
            return cmService.processos;
        };

        $scope.algorithm = function () {
            return cmService.config.algoritmo;
        };

        $scope.collapseAptos = function () {
            $rootScope.$broadcast('collapseAptos');
        };

        $scope.addProccess = function (active) {
            service.criarProcesso(active);
        };

        $scope.filterNaoExecutando = function (processo, prioridade) {
            var estadosNaoPermitidos = ['Executando', 'Concluido'];
            var prioridade = (prioridade ? processo.prioridade === parseInt(prioridade) : true)
            return prioridade && estadosNaoPermitidos.indexOf(processo.state) < 0;
        };

        $scope.checkColumn4 = function (processo) {
            var ret;
            switch ($scope.config.algoritmo) {
                case ROUND_ROBIN:
                    ret = processo.prioridade
                    break;
                case LTG:
                    ret = cmService.formatHours(processo.horaExecucao);
                    break;
                case INTERVAL:
                    ret = cmService.formatHours(processo.startTime) + ' - ' + cmService.formatHours(processo.endTime);
                    break;
            }
            return ret;
        };

        $scope.horaSistema = function() {
            return cmService.formatHours(new Date());
        }

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