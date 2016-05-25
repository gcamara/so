/**
 * Created by Gabriel on 05/03/2016.
 */
angular.module('so')
    .controller('ConfigController', ['$rootScope', '$scope', 'CommonFunctionsService', '$interval', '$injector', 'LogService', '$sce', ConfigController]);
function ConfigController($rootScope, $scope, service, $interval, $injector, logger, $sce) {

    $scope.labels = [1, 2, 3, 4, 5, 6];
    $scope.series = [];
    $scope.data = [];
    $scope.timer;
    $scope.filtrar = false;
    $scope.search = {msg: ''};
    $scope.service = service;
    $scope.processoHighlight;

    $scope.htmlTrust = function(value) {
        return $sce.trustAsHtml(value);
    }

    $scope.config = service.config;
    var memoria = $scope.config.memoria;
    memoria.algoritmo = $injector.get('BestFit');
    $scope.config.tasks;

    var classes = {
        'Abortado': 'danger',
        'Pronto': 'success',
        'Aguardando': 'warning',
        'Executando': 'info',
        'Concluido': 'success'
    };
    $scope.getClass = function(processo, tipo) {
        return tipo+"-"+classes[processo.state];
    }

    $scope.filtroProcessos = function(processo) {
        var states = ['Executando', 'Aguardando', 'Pronto'];
        return states.indexOf(processo.state) > -1;
    }

    $scope.mouseEntra = function(processo) {
        service.processoHighlight = processo.pid;
        $rootScope.$broadcast('processoHighlight', {processo: processo.pid})
    }

    $scope.mouseSai = function(processo) {
        service.processoHighlight = -1;
        $rootScope.$broadcast('processoHighlight', {processo: -1})
    }

    $scope.verificaProcessoHighlight = function() {
        return service.processoHighlight >= 0;
    }
    
    logger.sysInfo('Sistema inicializado...');
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
        function () {
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
        logger.sysInfo("Criando processadores..");
        if ($scope.config.tasks) {
            $scope.config.tasks.length = 0;
        }

        gerarDados();
        $scope.config.tasks = memoria.data;
        $scope.labels = [1, 2, 3, 4, 5, 6];
        $scope.config.processadores = [];
        $scope.series = [];
        $scope.data = [];
        $scope.config.memoria.consumo = 0;

        $scope.data.push($scope.config.processadorPrincipal.usage);
        $scope.series.push("Consumo de Processador");

        var i;
        for (i = 0; i < parseInt($scope.config.cores); i++) {
            var processador = {
                id: i,
                estado: 'Parado',
                processo: undefined,
                tempo: 0,
                usage: [0, 0, 0, 0, 0, 0]
            };
            $scope.config.processadores.push(processador);
        }

        $scope.timer = $interval(function () {
            var lbls = $scope.labels;
            lbls.shift();
            lbls.push(lbls[lbls.length - 1] + 1);
            $scope.data.forEach(function (data) {
                data.shift();
                data.push(data[4]);
            })
        }, 1000);
        $scope.config.running = true;
        $rootScope.$broadcast('iniciar');
    };

    $scope.parar = function () {
        logger.sysError('Usuario parou o sistema');
        $scope.config.processadores = [];
        $scope.config.running = false;
        $rootScope.$broadcast('parar');
        $interval.cancel($scope.timer);
        $scope.config.processadorPrincipal.usage = [0, 0, 0, 0, 0, 0];

        logger.sysInfo('Limpando todos os blocos')
        service.processos.forEach(function(processo) {
            processo.limparBlocos(service);
        });
        logger.sysInfo('Limpeza concluída');
    };

    $scope.alterarFiltrar = function() {
        $scope.filtrar = !$scope.filtrar;
        $scope.search.msg = '';
        $scope.search.tipo = '';
    }

    $rootScope.$on('parar', $scope.parar());


    function gerarDados() {
        logger.sysInfo("Gerando gráfico da memoria");
        memoria.data = {data: []};

        var data = memoria.data;
        var dataHoje = new Date();
        for (var j = 0; j < 2; j++) {
            for (var i = 0; i < 2; i++) {
                var dado = {
                    id: data.data.length + 1,
                    text: $scope.config.memoria.total / 100 + "kB",
                    start_date: dataHoje.getDate() + "/" + (dataHoje.getMonth() + 1) + "/" + dataHoje.getFullYear() + " 00:00:00",
                    duration: 1,
                    progress: 0
                };
                data.data.push(dado);
            }
            dataHoje.setDate(dataHoje.getDate() + 1);
        }
    }
};