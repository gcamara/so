/**
 * Created by Gabriel on 21/05/2016.
 */
angular.module('so').factory('MMUService', ['$rootScope', 'LogService', 'CommonFunctionsService', '$compile', '$timeout', MMU]);

function MMU(scope, logger, service, $compile, $timeout) {
    var self = this;

    var config = service.config;
    var memoria = config.memoria;
    var ultimaLinhaUsada = 0;
    var inUse = 0;
    var fila = [];
    
    self.totalLinha = (memoria.totalEmBytes()/10);

    scope.$on('parar', function () {
        ultimaLinhaUsada = 0;
        inUse = 0;
        for (var i = 0; i < 100; i += 10) {
            var indice = 'c' + i;
            service.blocos[indice] = [];
            var element = $('#' + indice);
            element.empty();
        }
    });
    
    self.proximaMemoria = function (processo, consumoBytes, aleatoria, bloco) {
        try {
            if (!inUse) {
                return buscarMemoria(processo, consumoBytes, aleatoria, bloco);
            }
            fila.push({p: processo, cons: consumoBytes, rand: aleatoria, bloco: bloco});
        } catch (e) {
            inUse = 0;
            throw e;
        }
    }

    self.divideBloco = function(processo, bloco, consumo) {
        logger.memoryInfo('MMU', 'Dividindo bloco '+bloco[0].getAttribute('id'));
        var parent = bloco[0].parentNode;
        var pct = consumo * (830/self.totalLinha);
        var pid1 = processo.pid+'-'+1;
        var bl1 = montarBloco(pid1, pct, processo, consumo);
        var bl2 = montarBloco(processo.pid+'-'+2, pct, processo, 0);
        bl1.processo = processo;
        service.blocos[parent.getAttribute('id')].push(bl1);
        service.blocos[parent.getAttribute('id')].push(bl2);

        var node = $(bloco[0].getAttribute('id'));
        bl1 = $compile(bl1)(scope);
        bl2 = $compile(bl2)(scope);
        node.after(bl2);
        node.after(bl1);
        node.remove();
        return bl1;
    }

    function montarBloco(id, porcentagem, processo, consumoBytes) {
        return '<bloco id="' + id + '" consumo="' + porcentagem + '" tooltip="Processo: P' + processo.pid + '     Consumo: ' + consumoBytes + ' bytes">';
    }

    function buscarMemoria(processo, consumoBytes, aleatoria, bloco) {
        inUse = 1;
        memoria.aumentarConsumo(consumoBytes);

        var porcentagem = consumoBytes*(830/self.totalLinha);

        if (!bloco) {
            var id = processo.pid + (aleatoria ? '-' + processo.blocos.length : '');
            bloco = $compile(montarBloco(id, porcentagem, processo, consumoBytes))(scope);
            bloco[0].setAttribute('lastWidth', porcentagem);
            service.blocos['c' + ultimaLinhaUsada].push(bloco);
            var element = proximoElemento(porcentagem);
            angular.element(element.append(bloco));
        }

        if (aleatoria) logger.memoryInfo('MMU', 'Processo ' + processo.pid + ' pediu memória: ' + consumoBytes + ' bytes');

        bloco.processo = processo;

        $timeout(function (bloco) {
            var id = bloco[0].getAttribute('id');
            var element = $('#cp' + id)[0];
            var color = container.random(100, 255);
            if (!processo.color) {
                processo.color = rgbToHex(color - container.random(20, 100), color - container.random(10, 100), color - container.random(20, 50));
            }
            element.style.background = processo.color;
            element.style.width = porcentagem + 'px';
            processo.blocos.push({bloco: element, uso: consumoBytes, blocoReal: bloco});
        }, 100, true, bloco);

        if (fila.length) {
            var attrbs = fila.pop();
            buscarMemoria(attrbs.p, attrbs.cons, attrbs.rand, attrbs.bloco);
        }
        inUse = 0;

        return bloco;
    }

    function getAllWidth() {
        var w = 0;
        var indice = 'c' + ultimaLinhaUsada;
        if (ultimaLinhaUsada < 100) {
            for (var i = 0; i < service.blocos[indice].length; i++) {
                var el = service.blocos[indice][i][0];
                if (el) {
                    var value = el.getAttribute('lastWidth')
                    if (value) w += parseFloat(value);
                }
            }
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

    function proximoElemento(porcentagem) {
        var celula = '#c' + ultimaLinhaUsada;
        var element = $(celula);
        var usedWidth = getAllWidth();
        if (porcentagem + usedWidth < 830) {
            return element;
        } else {
            ultimaLinhaUsada += 10;
            if (ultimaLinhaUsada > 90) {
                ultimaLinhaUsada = 90;
                throw "OutOfMemoryException - Não há mais blocos livres";
            }
            return proximoElemento(porcentagem);
        }
    }

    return self;
}
