/**
 * Created by gabrielcamara on 5/23/16.
 */
(function () {
    so.factory('QuickFit', ['CommonFunctionsService', 'MMUService', 'LogService', '$rootScope', '$interval', '$compile', QuickFit]);

    function QuickFit(service, MMU, logger, scope, $interval, $compile) {
        const NAME = 'Quick FIT';
        var self = this;
        var config = service.config;
        var memoria = config.memoria;
        self.id = '2';
        var requisicoes = 0;



        self.buscarMemoria = function (processo, qtdeUso, aleatoria) {
            logger.memoryInfo(NAME, "[Processo " + processo.pid + "] - Memória solicitada: " + qtdeUso + " bytes");
            requisicoes++;
            if (requisicoes == 20) {
                logger.memoryInfo(NAME, 'Criando filas');
                criarFilas();
            }
        }

        return self;
    }
})();