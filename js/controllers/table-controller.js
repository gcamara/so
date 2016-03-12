/**
 * Created by Gabriel on 11/03/2016.
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

    $scope.collapseAptos = function() {
        $rootScope.$broadcast('collapseAptos');
    }


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
})