/**
 * Created by Gabriel on 05/03/2016.
 */
angular.module('minhasDiretivas', [])
    .directive('tabela', function () {

        //Directive Definition Object
        var ddo = {};

        //A = Attribute, E = Element
        ddo.restrict = "E";
        ddo.transclude = true;

        ddo.scope = {
            titulo: '@'
        };

        ddo.replace = true;
        ddo.templateUrl = 'directives/table.html';
        ddo.controller = "TableController";

        return ddo;
    })
    .directive('lastElement', function ($timeout) {
        return function (scope, element, attr) {
            $timeout(function () {
                //Chama a funcao dentro do attributo Last Element e a executa
                //scope.$evalAsync(attr.lastElement);
            });
        };
    })
    .directive('processador', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                processador: '='
            },
            templateUrl: 'directives/processador.html'
        }
    })
    .directive("filaAptos", function (CommonFunctionsService) {
        return {
            scope: {
                titulo: '@',
                prioridade: '@',
                lista: '=',
                propriedade: '='
            },
            replace: true,
            require: '^tabela',
            templateUrl: 'directives/fila-aptos.html',
            link: function (scope, element, attrs, controller) {
                scope.processos = CommonFunctionsService.processos;

                scope.filterNaoExecutando = function (processo) {
                    return scope.$parent.filterNaoExecutando(processo, scope.prioridade);
                }
            }
        }
    })
    .directive("collapseButton", function ($rootScope) {
        return {
            restrict: 'A',
            replace: true,
            link: function (scope, element) {
                $rootScope.$on('collapseAptos', function () {
                    var clzz = 'glyphicon-chevron-up';

                    if (element.hasClass(clzz)) {
                        element.removeClass(clzz);
                        element.addClass('glyphicon-chevron-down');
                    } else {
                        element.addClass(clzz);
                        element.removeClass('glyphicon-chevron-down');
                    }
                });
            }
        }
    })
    .directive("stateElement", function ($rootScope, CommonFunctionsService) {

        var ddo = {
            restrict: 'A',
            replace: true,
            scope: {
                apto: '=',
                tipo: '@'
            },
            link: function (scope, element) {
                $rootScope.$on('aptoMudou', function (event, args) {
                    if (args.apto.pid != undefined) {
                        if (args.apto == scope.apto) {
                            var clzz = CommonFunctionsService.stateClass(scope.apto, scope.tipo);
                            var toRemove = clzz.replace(scope.tipo + '-', '');

                            var lista = ['success', 'warning', 'danger', 'info'];
                            lista.splice(lista.indexOf(toRemove), 1);
                            lista.forEach(function (subtipo) {
                                element.removeClass(scope.tipo + '-' + subtipo);
                            });

                            if (scope.apto.state === 'Concluido') {
                                element.removeClass('active');
                            }

                            element.addClass(clzz);
                        }
                    }
                });
            }
        }

        return ddo;
    })
    .directive("progressProcess", function () {
        return {
            replace: true,
            restrict: 'E',
            scope: {
                row: '='
            },
            link: function (scope) {
                scope.setWidth = function () {
                    if (scope.row) {
                        var width = scope.row.progress + "%";
                        return {width: width}
                    }
                }
            },
            templateUrl: 'directives/progress.html'
        };
    });