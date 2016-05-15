/**
 * Created by Gabriel on 14/05/2016.
 */
(function () {
    so.factory('BestFit', ['CommonFunctionsService', '$rootScope', 'LogService', BestFit]);

    function BestFit(service, $rootScope, logger) {
        const NAME = 'Best FIT';
        var self = this;
        var config = service.config;
        var memoria = config.memoria;
        self.id = '1';

        self.buscarMemoria = function (processo, qtdeUso) {
            logger.memoryInfo(NAME, "[Processo " + processo.pid + "] - Memória solicitada: " + qtdeUso + " bytes");
            qtdeUso /= 1024;
            try {
                memoria.aumentarConsumo(qtdeUso);
                var qtoOcupa = (qtdeUso * 100) / memoria.tamanhoBloco();
                //qtoOcupa *= 1024;

                var data = memoria.data.data;
                var blocoFinal;
                for (var i = 0; i < data.length; i++) {
                    var bloco = data[i];
                    if (!blocoFinal) {
                        blocoFinal = bloco;
                    }
                    var total = (1 - bloco.progress);
                    if (total == qtdeUso) {
                        blocoFinal = bloco;
                        break;
                    } else {
                        if (bloco.progress + (qtoOcupa / 100) < 1 && bloco.progress < blocoFinal.progress) {
                            blocoFinal = bloco;
                        }
                    }
                }
                blocoFinal.progress += qtoOcupa / 100;
                processo.blocos.push({bloco: blocoFinal, ocupa: qtoOcupa / 100, uso: qtdeUso});
                memoria.avisarConsumo($rootScope, bloco);
            } catch (e) {
                logger.memoryError(NAME, "OutOfMemoryException - Memoria livre: " + memoria.memoriaLivre().toFixed(2) + " bytes");
            }

        }
        return self;
    }
})();