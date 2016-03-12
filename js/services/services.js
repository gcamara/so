/**
 * Created by Gabriel on 08/03/2016.
 */

so.factory('AlgorithmExecuterService', function (RoundRobinService) {
    var algoritmo = {};


    algoritmo.construirAlgoritmo = function (tipo) {
        var service;
        switch (tipo) {
            case '1':
                service = RoundRobinService;
        }
        ;

        return service;
    }

    return algoritmo;
})
    .factory('CommonFunctionsService', function () {
        return {
            stateClass: function (row, type) {
                var clazz = '';
                switch (row.state) {
                    case 'Aguardando':
                        clazz = 'warning';
                        break;
                    case 'Executando':
                        clazz = 'info active';
                        break;
                    default:
                        clazz = 'success';
                }

                return type + "-" + clazz;
            },

            config: {
                cores: 4,
                algoritmo: "1",
                quantum: 1,
                processos: 1,
                processadores: [],
                running: true
            }
        };
    });