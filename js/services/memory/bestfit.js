/**
 * Created by Gabriel on 14/05/2016.
 */
(function () {
    so.factory('BestFit', ['CommonFunctionsService', '$rootScope', 'LogService', 'MMUService', BestFit]);

    function BestFit(service, $rootScope, logger, MMU) {
        const NAME = 'Best FIT';
        var self = this;
        self.id = '1';

        self.buscarMemoria = function (processo, qtdeUso, aleatoria) {
            logger.memoryInfo(NAME, "[Processo " + processo.pid + "] - Memória solicitada: " + qtdeUso + " bytes");
            //try {
                var bloco = buscarBloco(qtdeUso);
                bloco = MMU.proximaMemoria(processo, qtdeUso, aleatoria, bloco);
                if (bloco) logger.memoryInfo(NAME, "Bloco "+bloco[0].getAttribute('id')+" ocupado pelo processo "+processo.pid);
            /*} catch (e) {
                logger.memoryError(NAME, e);
                service.abortarProcesso(processo);
                console.error(e);
            }*/
        }

        function buscarBloco(tamanho) {
            tamanho *= (MMU.getRowWidth()/MMU.totalLinha);
            var ultimoTamanho = 0;
            var ultimoBloco;
            for (var indice in service.blocos) {
                var blocos = service.blocos[indice];
                for (var j = 0; j < blocos.length; j++) {
                    for (var k = 0; k < blocos.length; k++) {
                        if (blocos[k].processo) continue;
                        var tam = blocos[k][0].getAttribute('lastWidth');
                        var existeBloco = (ultimoBloco ? tam < ultimoTamanho : true);
                        if (existeBloco && parseFloat(tam) >= tamanho) {
                            ultimoBloco = blocos[k];
                            ultimoTamanho = tam;
                        }
                    }
                }
            }
            return ultimoBloco;
        }

        return self;
    }
})();