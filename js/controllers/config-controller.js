/**
 * Created by Gabriel on 05/03/2016.
 */
angular.module('so')
    .controller('ConfigController', function ($rootScope, $scope) {

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
            $scope.config.processadores = [];
            $scope.config.running = false;
            $rootScope.$broadcast('parar');
        }
    });