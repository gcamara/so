/**
 * Created by Gabriel on 20/03/2016.
 */
so.factory('IntervalBasedService', function ($rootScope, CommonFunctionsService) {
    var interval = {};
    interval.cmService = CommonFunctionsService;
    interval.config = interval.cmService.config;
    interval.processos = [];
    interval.processadores = [];
    interval.configurar = function () {
        this.config.aptos = [];
        this.cmService.headers = ['PID', 'Processo', 'Progresso', 'Estado', 'Intervalo', 'ETC(s)'];
        var i = 0;
        for (i = 0; i < this.processadores.length; i++) {
            processadores[i].aptos = [];
        }
        this.processadores = angular.copy(this.service.config.processadores);
    }

    interval.executar = function() {
        console.log("Iniciando Interval");
    }


    return interval;
});