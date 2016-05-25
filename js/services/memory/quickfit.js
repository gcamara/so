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
        self.memoriasPedidas = [];
        var blocosAcessados = [];
        var blocosVazios = [];

        scope.$on('iniciar', function() {
            self.memoriasPedidas.length = 0;
            blocosAcessados.length = 0;
            requisicoes = 0;
            blocosVazios = [];
        });

        self.buscarMemoria = function (processo, qtdeUso, aleatoria) {
            logger.memoryInfo(NAME, "[Processo " + processo.pid + "] - Memória solicitada: " + qtdeUso + " bytes");
            try {
                requisicoes++;
                if (requisicoes == 20) {
                    logger.memoryInfo(NAME, 'Criando filas');
                    self.criarFilas();
                    requisicoes = 0;
                }
                verificarEAtribuir(qtdeUso);
                var pctDeUso = qtdeUso * (MMU.getRowWidth()/MMU.totalLinha);
                var bloco = buscarBloco(qtdeUso, pctDeUso, processo);
                bloco = MMU.proximaMemoria(processo, qtdeUso, aleatoria, bloco);
            } catch (e) {
                logger.memoryError(NAME, e);
                service.abortarProcesso(processo);
                throw e;
            }
        }

        self.limpeza = function(bloco, uso) {
            var range = getRange(uso);
            if (range in blocosAcessados) blocosAcessados[range].push(bloco);
            else {
                if (!blocosVazios[range]) blocosVazios[range] = [];
                blocosVazios[range].push(bloco);
            }
        }

        self.criarFilas = function() {
            blocosVazios.forEach(function(chave) {
                if (chave in self.memoriasPedidas) {
                    self.memoriasPedidas[chave] += 1;
                } else {
                    self.memoriasPedidas[chave] = 1;
                }
            });

            blocosAcessados = [];

            var keys = []; for(var key in self.memoriasPedidas) keys.push(key);
            keys = keys.sort(function(a,b){return self.memoriasPedidas[b]-self.memoriasPedidas[a]});
            keys = keys.slice(0, 3);
            
            keys.forEach(function(key) {
                var start = key.split('-')[0];
                var end = key.split('-')[1];
                blocosAcessados[key] = [];
                var qtde = self.memoriasPedidas[key];
                logger.memoryInfo(NAME, 'Fila criada para intervalo <b>['+start+'-'+end+']</b> bytes que foi solicitada '+qtde+' vezes');
            });
        }

        function buscarBloco(qtdeUso, pctUso, processo) {
            var bloco;
            var range = getRange(qtdeUso);
            if (range in blocosAcessados) {
                bloco = blocosAcessados[range].shift();
                if (bloco) {
                    var tam = MMU.calcularTamanhoBloco(bloco);
                    logger.memoryInfo(NAME, '[Processo '+processo.pid+'] - Bloco retirado da fila <b>'+range+'</b> e possui '+tam+'bytes');
                }  else {
                    logger.memoryError(NAME, '[Processo '+ processo.pid+'] - Não há blocos vazios para a fila <b>'+range+'</b>.. criando novo bloco.');
                }
            }
            else {
                for (var indice in service.blocos) {
                    var blocos = service.blocos[indice];
                    for (var j =0; j < blocos.length; j++) {
                        var blocoCorrente = blocos[j];
                        var tam = blocos[j][0].getAttribute('lastWidth');
                        if (!blocoCorrente.processo && parseFloat(tam) > pctUso){
                            bloco = blocoCorrente;
                            break;
                        }
                    }
                    if (bloco) break;
                }
            }
            return bloco;
        }

        function verificarEAtribuir(qtdeUso) {
            var range = getRange(qtdeUso);
            if (!(range in self.memoriasPedidas)) {
                self.memoriasPedidas[range] = 1;
            } else {
                self.memoriasPedidas[range] += 1;
            }
        }

        function getRange(qtdeUso) {
            var qtdeRange = qtdeUso;
            var primeiroValor = parseInt(qtdeUso.toString().charAt(0));
            var limitUp = 0;
            if (qtdeUso < 100) {
                limitUp = (primeiroValor + 1) * 10;
                qtdeRange = primeiroValor * 10;
            }
            else if (qtdeUso > 100 && qtdeUso < 900) {
                limitUp = (primeiroValor + 1) * 100;
                qtdeRange = primeiroValor * 100
            }
            else if (qtdeUso > 900) { 
                limitUp = 1000;
                qtdeRange = 900;
            }

            return qtdeRange+'-'+limitUp;
        }

        return self;
    }
})();