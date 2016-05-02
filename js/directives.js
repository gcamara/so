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
    }).directive("containerPrincipal", function(CommonFunctionsService) {
        return {
            restrict: 'A',
            controller: '',
            link: function(scope, element, attrs, controller) {
                scope.$watch(function() {
                    return CommonFunctionsService.config.running;
                }, function(newValue) {
                    if (newValue) {
                        element.removeClass('container');
                        element.addClass('col-md-6');
                    } else {
                        element.removeClass('col-md-6');
                        element.addClass('container');
                    }
                })
            }
        }
}).directive('dhxGantt', function($rootScope) {
    return {
        restrict: 'A',
        scope: false,
        transclude: true,
        template: '<div ng-transclude></div>',

        link:function ($scope, $element, $attrs, $controller){
            //watch data collection, reload on changes
            var i = 0;
            $scope.$watch($attrs.data, function(collection){
                // gantt.clearAll();
                // Evitar o digest
                if (i < 2) {
                    gantt.parse(collection, "json");
                    i++;
                }
            }, true);

            //size of gantt
            // $scope.$watch(function() {
            //     return $element[0].offsetWidth + "." + $element[0].offsetHeight;
            // }, function() {
            //     gantt.setSizes();
            // });

            $rootScope.$on('memoryConsumption', function(event, args) {
                console.log(args.id+"|"+args.valor);
                // console.log(gantt);
                gantt.getTask(args.id).progress = args.valor;
                gantt.updateTask(args.id);
            });

            var config = gantt.config;
            config.show_grid = false;
            config.grid_width = 0;
            config.drag_lightbox =false;
            config.drag_links = false;
            config.drag_move = false;
            config.drag_progress = false;
            config.drag_resize = false;
            config.readonly = true;
            config.select_task = false;
            config.show_errors = false;
            config.show_links = false;
            config.scale_height = 0;
            config.row_height = 25;
            //config.show_chart = false;
            //init gantt
            gantt.init($element[0]);
        }
    }
});