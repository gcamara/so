/**
 * Created by Gabriel on 08/03/2016.
 */

so.factory('AlgorithmExecuterService', function (RoundRobinService) {
    var algoritmo = {};


    algoritmo.construirAlgoritmo = function(tipo) {
        var service;
        switch (tipo) {
            case '1':
                service = RoundRobinService;
        };

        return service;
    }

    return algoritmo;
});