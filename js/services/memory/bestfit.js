/**
 * Created by Gabriel on 14/05/2016.
 */
(function () {
    so.factory('BestFit', ['CommonFunctionsService', '$rootScope', 'LogService', 'MMUService', BestFit]);

    function BestFit(service, $rootScope, logger, MMU) {
        const NAME = 'Best FIT';
        var self = this;
        self.id = '1';

        self.buscarMemoria = function (processo, qtdeUso) {
            logger.memoryInfo(NAME, "[Processo " + processo.pid + "] - Memória solicitada: " + qtdeUso + " bytes");
            try {
                qtdeUso /= 1024;
                var qtoOcupa = (qtdeUso * 100);
                var promise = MMU.proximaMemoria(processo, qtoOcupa, qtdeUso);
                promise.then(function(bloco) {
                    logger.memoryInfo(NAME, "Bloco "+bloco+" ocupado pelo processo "+processo.pid);
                });
            } catch (e) {
                logger.memoryError(NAME, e);
                service.abortarProcesso(processo);
                console.error(e);
            }

        }
        return self;
    }
})();