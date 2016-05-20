/**
 * Created by Gabriel on 11/03/2016.
 */
angular.module('so')
    .controller('TableController', function ($timeout, $rootScope, $scope, $interval, CommonFunctionsService, BestFit) {
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

        $scope.remainder = function () {
            if (service && service.remainder) {
                return service.remainder;
            } else {
                return [];
            }
        }

        var classes = {
            'Abortado': 'danger',
            'Pronto': 'success',
            'Aguardando': 'warning',
            'Executando': 'info active',
            'Concluido': 'success'
        };
        $scope.getClass = function(processo, tipo) {
            if (processo) {
               return tipo+"-"+classes[processo.state];
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
            if (service.config.running) {
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
            }
        };

        $scope.horaSistema = function () {
            return cmService.formatHours(new Date());
        }

        $scope.updateValues;
        $scope.$on('iniciar', function () {
            service = cmService.construirAlgoritmo($scope.config.algoritmo);
            $scope.config.memoria.algoritmo = BestFit;
            if (service) {
                service.configurar();
                cmService.aptos = service.aptos;
                $scope.aptos = cmService.aptos;

                service.executar();
            } else {
                alert('Algoritmo nao implementado');
                $scope.$parent.parar();
            }

            var lastData = 10;
            var ultimaColuna = 1;
        });

        $scope.$on('parar', function (events, args) {
            $scope.processos.length = 0;
            $interval.cancel($scope.updateValues);
        });

        $scope.tempoLinha = function (row) {
            return Math.round(row.tempoTotal - row.tempo);
        }
    })
;