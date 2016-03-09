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

        ddo.templateUrl = 'directives/table.html';
        ddo.controller = "TableController";

        /*Ao linkar o elemento, sabe-se que, caso haja algum transcluded
         esse elemento transcluded tem um escopo isolado do restante da diretiva.
         Assim, nao se pode acessar os metodos do controlador da diretiva.
         Para que isso fosse feito, o elemento adicionado dentro do escopo de transclude eh removido
         e adicionado um clone em seu lugar, porem esse clone tera um novo escopo, ou seja, o da diretiva.
         */
        //ddo.link = function (scope, element, attrs, ctrl, transclude) {
        //    transclude(scope, function (clone, scope) {
        //        var transcludedOutOfScope = element[0].childNodes[0];
        //        transcludedOutOfScope.removeChild(transcludedOutOfScope.childNodes[3]);
        //        element.append(clone);
        //    });
        //};

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
    });