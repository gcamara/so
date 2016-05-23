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
            try {
                var bloco = buscarBloco(qtdeUso);
                bloco = MMU.proximaMemoria(processo, qtdeUso, aleatoria, bloco);
                if (bloco) logger.memoryInfo(NAME, "Bloco "+bloco[0].getAttribute('id')+" ocupado pelo processo "+processo.pid);
            } catch (e) {
                logger.memoryError(NAME, e);
                service.abortarProcesso(processo);
                logger.memoryError(NAME, 'Processo '+processo.pid+' abortado por falta de memoria');
            }
        }

        function buscarBloco(tamanho) {
            tamanho *= (830/MMU.totalLinha);
            var ultimoTamanho = 0;
            var ultimoBloco;
            for (var i = 0; i < 100; i+= 10) {
                var blocos = service.blocos['c'+i];
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