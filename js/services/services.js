/**
 * Created by Gabriel on 08/03/2016.
 */

so.factory('AlgorithmExecuterService', function (RoundRobinService, LTGService, IntervalBasedService) {
        var algoritmo = {};


        algoritmo.construirAlgoritmo = function (tipo) {
            var service;
            switch (tipo) {
                case '1':
                    service = RoundRobinService;
                    break;
                case '2':
                    service = LTGService;
                    break;
                case '3':
                    service = IntervalBasedService;
                    break;
            }
            return service;
        };

        return algoritmo;
    })
    .factory('CommonFunctionsService', function () {
        return {
            self: this,

            increaseProcessorUsage: function (processador) {
                processador.usage[5] += 1;
                $(this)[0].config.processadorPrincipal.usage[5] +=1;
            },
            decreaseProcessorUsage: function (processador) {
                processador.usage[5] -= 1;
                $(this)[0].config.processadorPrincipal.usage[5] -=1;
            },
            stateClass: function (row, type) {
                var clazz = '';
                switch (row.state) {
                    case 'Aguardando':
                        clazz = 'warning';
                        break;
                    case 'Executando':
                        clazz = 'info active';
                        break;
                    case 'Abortado':
                        clazz = 'danger';
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
                running: false,
                processadorPrincipal: {
                    id: 'Principal',
                    usage: [0,0,0,0,0,0]
                }
            },
            aptos: [],
            processos: [],
            headers: [],

            //Fonte https://pt.wikipedia.org/wiki/Insertion_sort
            insertionSort: function (processos) {
                var i, j, eleito;

                for (i = 1; i <= processos.length - 1; i++) {
                    eleito = processos[i];
                    j = i - 1;
                    while (j >= 0 && eleito.horaExecucao.getTime() < processos[j].horaExecucao.getTime()) {
                        processos[j + 1] = processos[j];
                        j -= 1;
                    }
                    if (j != (i - 1)) {
                        processos[j + 1] = eleito;
                    }
                }
            },
            formatHours: function (data) {
                var hours = data.getHours() < 10 ? '0' + data.getHours() : data.getHours();
                var minutes = data.getMinutes() < 10 ? '0' + data.getMinutes() : data.getMinutes();
                var seconds = data.getSeconds() < 10 ? '0' + data.getSeconds() : data.getSeconds();

                return hours + ":" + minutes + ":" + seconds;
            }
        };
    });