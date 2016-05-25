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
};

so.directive('memoria', DirectiveMemoria);

function DirectiveMemoria() {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'directives/memoria.html',
    }
};

so.directive('bloco', DiretivaBloco);

function DiretivaBloco() {
    return {
        restrict: 'E',
        templateUrl: 'directives/bloco.html',
        scope: {
            texto: '@',
            tooltip: '@',
            consumo: '=',
            id: '@'
        },
        link: function(scope, element, attrs, controller) {
                scope.$on('processoHighlight', function(event, args){
                    if (args.processo == element[0].getAttribute('pid')) {
                        element.addClass('highlight');
                    } else {
                        element.removeClass('highlight');
                    }
                });
            }
        }
    }