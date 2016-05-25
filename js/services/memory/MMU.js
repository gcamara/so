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

    scope.$on('iniciar', function() {
        service.rowSizes = [0,0,0,0,0,0,0,0,0,0];
    });

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

    self.montarBloco = function(id, porcentagem, processo, consumoBytes) {
        return '<bloco id="' + id + '" consumo="' + porcentagem + '" tooltip="Processo: P' + (processo ? processo.pid : '') + '     Consumo: ' + consumoBytes + ' bytes">';
    }

    function buscarMemoria(processo, consumoBytes, aleatoria, bloco) {
        inUse = 1;
        memoria.aumentarConsumo(consumoBytes, processo);

        var porcentagem = consumoBytes*(self.getRowWidth()/self.totalLinha);

        if (!bloco) {
            var id = processo.pid + (aleatoria ? '-' + processo.blocos.length : '');
            bloco = $compile(self.montarBloco(id, porcentagem, processo, consumoBytes))(scope);
            bloco[0].setAttribute('lastWidth', porcentagem);
            service.blocos['c' + ultimaLinhaUsada].push(bloco);
            service.rowSizes[ultimaLinhaUsada/10] += porcentagem;
            var element = self.proximoElemento(porcentagem);
            angular.element(element.append(bloco));
        }

        if (aleatoria) logger.memoryInfo('MMU', '[Processo ' + processo.pid + '] - Solicitou memória durante execução: ' + consumoBytes + ' bytes');

        bloco.processo = processo;
        bloco[0].setAttribute('pid', processo.pid);

        $timeout(function (bloco) {
            var id = bloco[0].getAttribute('id');
            var element = $('#cp' + id)[0];
            var color = container.random(100, 255);
            if (!processo.color) {
                //processo.color = rgbToHex(color - container.random(20, 100), color - container.random(10, 100), color - container.random(20, 50));
                //processo.color = "rgba(12, 12, 255, .5)"
                processo.color = "#337ab7";
            }
            element.style.background = processo.color;
            element.style.width = porcentagem + 'px';
            processo.blocos.push({bloco: element, uso: consumoBytes, blocoReal: bloco});
        }, 200, true, bloco);

        if (fila.length) {
            var attrbs = fila.pop();
            buscarMemoria(attrbs.p, attrbs.cons, attrbs.rand, attrbs.bloco);
        }
        inUse = 0;

        return bloco;
    }

    self.calcularTamanhoBloco = function(bloco) {
        var tam = parseFloat(bloco[0].getAttribute('lastWidth'));
        tam /= (self.getRowWidth()/self.totalLinha);
        return tam;
    }

    self.getRowWidth = function() {
        var celula = '#c0';
        var element = $(celula);
        return element[0].offsetWidth - 5;
    }

    function getAllWidth() {
        var w = 0;
        if (ultimaLinhaUsada < 100) {
            w = service.rowSizes[ultimaLinhaUsada/10];
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

    self.proximoElemento = function(porcentagem) {
        var celula = '#c' + ultimaLinhaUsada;
        var element = $(celula);

        var usedWidth = getAllWidth();
        if (porcentagem + usedWidth < self.getRowWidth() - 35) {
            return element;
        } else {
            ultimaLinhaUsada += 10;
            if (ultimaLinhaUsada > 90) {
                ultimaLinhaUsada = 0;
                throw "OutOfMemoryException - Não há mais blocos livres";
            }
            return self.proximoElemento(porcentagem);
        }
    }


    return self;
}
