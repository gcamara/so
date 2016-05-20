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
        ddo.controllerAs = 'vm';

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
            templateUrl: 'directives/progress.html',
            controller: 'TableController'
        };
    }).directive("containerPrincipal", function (CommonFunctionsService) {
    return {
        restrict: 'A',
        controller: '',
        link: function (scope, element, attrs, controller) {
            scope.$watch(function () {
                return CommonFunctionsService.config.running;
            }, function (newValue) {
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
}).directive('dhxGantt', function ($rootScope, CommonFunctionsService) {
    var service = CommonFunctionsService;
    return {
        restrict: 'A',
        scope: {
            data: "="
        },
        transclude: true,
        template: '<div ng-transclude></div>',

        link: function ($scope, $element, $attrs, $controller) {
            //watch data collection, reload on changes
            var i = 0;
            $rootScope.$on('iniciar', function() {
                gantt.parse(service.config.tasks, "json");
            });


            $rootScope.$on('memoryConsumption', function (event, args) {
                var task = gantt.getTask(args.id);
                if (task) {
                    task.progress = args.valor;
                    gantt.updateTask(args.id);
                }
            });

            var config = gantt.config;
            config.show_grid = false;
            config.grid_width = 0;
            config.drag_lightbox = false;
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

so.directive('console', ['CommonFunctionsService', '$interval', DirectiveConsole]);

function DirectiveConsole(service, interval) {
    var self =this;
    self.restrict = "E";
    self.transclude = true;
    self.template = '<div class="col-md-12" style="margin-left: 10px; width: 98%; height: 250px; overflow: auto"><ng-transclude></ng-transclude></div>'
    self.link = link;

    function link(scope, element) {
        var scrollDown;
        var fn = function() { element[0].firstChild.scrollTop += 9999999 };
        element.bind('mouseover', function() {
            scrollDown = interval(fn, 100);
        })
        element.bind('mouseout', function() {
            interval.cancel(scrollDown);
        })
        element.bind('mousedown', function(event) {
            interval.cancel(scrollDown);
        })
        element.bind('mouseup', function() {
            scrollDown = interval(fn, 100);
        })
    }
    return self;
}