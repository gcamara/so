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
            try {
                qtdeUso /= 1024;
                memoria.aumentarConsumo(qtdeUso);
                var qtoOcupa = (qtdeUso * 100) / memoria.tamanhoBloco();
            

                var data = memoria.data.data;
                var blocoFinal;
                for (var i = 0; i < data.length; i++) {
                    var bloco = data[i];

                    if (bloco.processo) {
                        continue;
                    }

                    if (!blocoFinal) {
                        blocoFinal = bloco;
                    }
                    if (bloco.process < blocoFinal.process) {
                        var total = (1 - bloco.progress);
                        if (total == qtdeUso) {
                            blocoFinal = bloco;
                            break;
                        } else if (bloco.progress + (qtoOcupa / 100) < 1) {
                            blocoFinal = bloco;
                        }
                    }   
                }
                if (!blocoFinal) {
                    memoria.diminuirConsumo(qtdeUso);
                    throw "OutOfBlockException - Sem blocos disponíveis para o processo "+processo.pid;
                }
                blocoFinal.processo = processo;
                blocoFinal.progress += qtoOcupa / 100;
                logger.memoryInfo(NAME, "Bloco "+blocoFinal.id+" ocupado pelo processo "+processo.pid);
                processo.blocos.push({bloco: blocoFinal, ocupa: qtoOcupa/100, uso: qtdeUso});
                memoria.avisarConsumo($rootScope, blocoFinal);
            } catch (e) {
                logger.memoryError(NAME, e);
                service.abortarProcesso(processo);
            }

        }
        return self;
    }
})();