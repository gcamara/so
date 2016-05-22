/**
 * Created by Gabriel on 21/05/2016.
 */
angular.module('so').factory('MMUService', ['$rootScope','LogService', 'CommonFunctionsService', '$compile', '$timeout', '$q', MMU]);

var proximaMemoria = 0;
var usados = 0;
function MMU(scope, logger, service, $compile, $timeout, $q) {
    var self = this;

    var config = service.config;
    var memoria = config.memoria;
    var ultimaLinhaUsada = 0;
    var inUse = 0;

    self.proximaMemoria = function (processo, porcentagem, consumoBytes) {
        return $q(function(resolve, reject) {
            memoria.aumentarConsumo(consumoBytes);
            if (porcentagem < 1) {
                porcentagem = 1;
            }

            var element = proximoElemento(porcentagem);

            var bloco = $compile('<bloco id="' + processo.pid + '"consumo="' + porcentagem + '" tooltip="Processo: P' + processo.pid + '     Consumo: ' + consumoBytes.toFixed(2) + ' bytes">')(scope);
            service.blocos.push(bloco);
            angular.element(element.append(bloco));

            $timeout(function (el) {
                var element = $('#cp' + processo.pid)[0];
                var color = container.random(100, 255);
                if (!processo.color) {
                    processo.color = rgbToHex(color - container.random(20, 100), color - container.random(10, 100), color - container.random(20, 50));
                }
                element.style.background = processo.color;

                var lastElement = service.blocos[service.blocos.length-2];
                if (lastElement) {
                    var children = lastElement.children[lastElement.children.length - 1];
                    var w = getAllWidth();

                    if (w < el[0].offsetWidth) {
                        var left = el[0].children.length + 1;
                        if (children) element.style.left = (w + left) + "px";
                    }
                    else {

                    }
                }
                element.style.width = porcentagem + 'px';
                element.setAttribute('lastWidth', porcentagem);
                processo.blocos.push({bloco: element, uso: consumoBytes});
            }, 300, true, element);
            self.memoriaAleatoria(processo);
            inUse = 0;

            // usados++;

            resolve(bloco);
        });
    }

    function getAllWidth() {
        var w = 0;
        for (var i = 0; i < service.blocos.length; i++) {
            w += parseFloat(service.blocos[i][0].children[0].children[0].getAttribute('lastWidth'));
        }
        return w;
    }

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    self.memoriaAleatoria = function(processo) {
        sortear(1, 10, function() {
            processo.pedirMemoria = $timeout(function(processo) {
                var consumoEmBytes = container.random(32, 1024);
                var consumoEmPCT = (consumoEmBytes/1024 * 100);
                logger.memoryInfo('MAIN', 'Processo '+processo.pid+' pediu memória: '+consumoEmBytes+' bytes');
                self.proximaMemoria(processo, consumoEmPCT, consumoEmBytes);
            }, 2000, true, processo);
        })

    }

    function sortear(min, max, callback) {
        var numeros = [1, 5]; //20% de chance
        var chance = container.random(min, max);
        (callback && numeros.indexOf(chance)>-1) && callback();
    }

    function proximoElemento(porcentagem) {
        var celula = '#c'+ultimaLinhaUsada;
        var element = $(celula);
        var totalWidth = element[0].offsetWidth;
        var usedWidth = getAllWidth();
        if (porcentagem + usedWidth < totalWidth-10) {
            return element;
        } else {
            if (ultimaLinhaUsada > 90) {
                throw "OutOfMemoryException - Não há mais blocos livres";
            }
            ultimaLinhaUsada += 10;
            return proximoElemento(porcentagem);
        }
    }

    return self;
}
