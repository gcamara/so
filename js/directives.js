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
        var ddo = {};
        ddo.scope = {
            id: '@',
            estado: '@',
            processo: '@',
            tempo: '@'
        };

        ddo.templateUrl = 'directives/processador.html';
        return ddo;
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