/**
 * Created by Gabriel on 15/05/2016.
 */
/**
 * Created by Gabriel on 14/05/2016.
 */
(function () {
    so.factory('MergeFit', ['CommonFunctionsService', '$rootScope', 'LogService', MergeFit]);

    function MergeFit(service, $rootScope, logger) {
        const NAME = 'Merge FIT';
        var self = this;
        var config = service.config;
        var memoria = config.memoria;
        var blocos = angular.copy(memoria.data.data);
        self.id = '3';

        self.buscarMemoria = function (processo, qtdeUso) {
            logger.memoryInfo(NAME, "[Processo " + processo.pid + "] - Memória solicitada: " + qtdeUso + " bytes");
            qtdeUso /= 1024;
            try {
                memoria.aumentarConsumo(qtdeUso);
                var qtoOcupa = qtdeUso / memoria.tamanhoBloco();
                
                var data = memoria.data.data;
                var blocoFinal;
                
                var blocosOcupados = [];
                var diferenca = 0;
                blocos.forEach(function(bloco) {
                    if (bloco.progress < qtoOcupa) {
                        diferenca = bloco.progress + qtoOcupa;
                        if (diferenca > 1) {
                            var restoProgress = 1 - bloco.progress;
                            bloco.progress += restoProgress;
                            processo.blocos.push({bloco: bloco, ocupa: restoProgress, uso: qtdeUso});
                            blocosOcupados.push(bloco);
                        }
                    }
                })

                memoria.avisarConsumo($rootScope, bloco);
            } catch (e) {
                logger.error(NAME, "OutOfMemoryException - Memoria livre: " + memoria.memoriaLivre().toFixed(2) + " bytes");
            }

        }
        return self;
    }
})();