/**
 * Created by Gabriel on 15/05/2016.
 */
/**
 * Created by Gabriel on 14/05/2016.
 */
(function () {
    so.factory('MergeFit', ['CommonFunctionsService', 'MMUService', 'LogService', MergeFit]);

    function MergeFit(service, MMU, logger) {
        const NAME = 'Merge FIT';
        var self = this;
        var config = service.config;
        var memoria = config.memoria;
        self.id = '3';

        self.buscarMemoria = function (processo, qtdeUso, aleatoria) {
            logger.memoryInfo(NAME, "[Processo " + processo.pid + "] - Memória solicitada: " + qtdeUso + " bytes");
            try{
                var bloco = buscarBloco(qtdeUso);
                if (bloco) {
                    var tam = bloco[0].getAttribute('lastWidth');
                    var pctDeUso = qtdeUso * (830/MMU.totalLinha);
                    if (pctDeUso < tam) {
                        bloco = MMU.divideBloco(processo, bloco, qtdeUso);
                    }
                }
                MMU.proximaMemoria(processo, qtdeUso, aleatoria, bloco);
            } catch (e) {
                logger.memoryError(NAME, e);
                service.abortarProcesso(processo);
            }

        }

        function buscarBloco(tamanho) {
            tamanho *= (830/MMU.totalLinha);
            var ultimoBloco;
            for (var i = 0; i < 100; i+= 10) {
                for (var j = 0; j < service.blocos['c'+i].length; j++) {
                    var blocos = service.blocos['c'+i];
                    for (var k = 0; k < blocos.length; k++) {
                        if (blocos[k].processo) continue;
                        var tam = blocos[k][0].getAttribute('lastWidth');
                        if (tam >= tamanho) {
                            ultimoBloco = blocos[k];
                            break;
                        }
                    }
                }
            }
            return ultimoBloco;
        }

        return self;
    }
})();