/**
 * Created by Gabriel on 05/03/2016.
 */
angular.module('so')
    .controller('ConfigController', function ($rootScope, $scope, CommonFunctionsService, $interval) {

        $scope.labels = [1, 2, 3, 4, 5, 6];
        $scope.series = [];
        $scope.data = [];
        $scope.timer;

        $scope.config = CommonFunctionsService.config;

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
            $scope.labels = [1, 2, 3, 4, 5, 6];
            $scope.config.processadores = [];
            $scope.series = [];
            $scope.data = [];

            $scope.data.push($scope.config.processadorPrincipal.usage);
            $scope.series.push("Uso Total");

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

                $scope.series.push("Processador " + i);
                $scope.data.push(processador.usage);
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
            $scope.config.processadores = [];
            $scope.config.running = false;
            $rootScope.$broadcast('parar');
            $interval.cancel($scope.timer);
            $scope.config.processadorPrincipal.usage = [0,0,0,0,0,0];
        };

        $rootScope.$on('parar', $scope.parar());
    });