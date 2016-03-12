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
            scope:{
                processador: '='
            },
            templateUrl: 'directives/processador.html'
        }
    })
    .directive("filaAptos", function () {
        return {
            scope: {
                prioridade: '@'
            },
            replace: true,
            require: '^tabela',
            templateUrl: 'directives/fila-aptos.html',
            link: function (scope, element, attrs, controller) {

                scope.processos = function () {
                    return scope.$parent.processos();
                }

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
                    var clzz = 'glyphicon-chevron-down'

                    if (element.hasClass(clzz)) {
                        element.removeClass(clzz);
                        element.addClass('glyphicon-chevron-up');
                    } else {
                        element.addClass(clzz);
                        element.removeClass('glyphicon-chevron-up');
                    }
                });
            }
        }
    })
    .directive("stateElement", function ($rootScope, CommonFunctionsService) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                apto: '=',
                tipo: '@',
                ultimoTipo: '@'
            },
            link: function (scope, element) {
                $rootScope.$on('aptoMudou', function (event, args) {
                    if (args.apto == scope.apto) {
                        if (!scope.ultimoTipo) {
                            scope.ultimoTipo = scope.tipo + args.lastState;
                        }
                        element.removeClass(scope.ultimoTipo);
                        var clzz = CommonFunctionsService.stateClass(scope.apto, scope.tipo);
                        scope.ultimoTipo = clzz;
                        element.addClass(clzz);
                    }
                });
            }
        }
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