/**
 * Created by Gabriel on 15/05/2016.
 */
/**
 * Created by Gabriel on 14/05/2016.
 */
(function () {
    so.factory('MergeFit', ['CommonFunctionsService', 'MMUService', 'LogService', '$rootScope', '$interval', '$compile', MergeFit]);

    function MergeFit(service, MMU, logger, scope, $interval, $compile) {
        const NAME = 'Merge FIT';
        var self = this;
        var config = service.config;
        var memoria = config.memoria;
        self.id = '3';
        var checkMerge;
        var inUse = 0;

        scope.$on('parar', function() {
            $interval.cancel(checkMerge);
            checkMerge = null;
            inUse = 0;
        });

        self.buscarMemoria = function (processo, qtdeUso, aleatoria) {
            logger.memoryInfo(NAME, "[Processo " + processo.pid + "] - Memória solicitada: " + qtdeUso + " bytes");
            try{

                if (!checkMerge) {
                    logger.memoryInfo(NAME, 'Buscando blocos para mesclar...');
                    checkMerge = $interval(function() {
                        if (!inUse) mergeBlocks();
                    }, 1000);
                }

                var bloco = buscarBloco(qtdeUso);
                if (bloco) {
                    var tam = bloco[0].getAttribute('lastWidth');
                    var pctDeUso = qtdeUso * (MMU.getRowWidth()/MMU.totalLinha);
                    if (pctDeUso < parseFloat(tam)) {
                        bloco = divideBloco(processo, bloco, qtdeUso);
                    }
                }

                MMU.proximaMemoria(processo, qtdeUso, aleatoria, bloco);
            } catch (e) {
                logger.memoryError(NAME, e);
                service.abortarProcesso(processo);
                console.error(e);
            }

        }

        function buscarBloco(tamanho) {
            tamanho *= (MMU.getRowWidth()/MMU.totalLinha);
            var ultimoBloco;
            for (var indice in service.blocos) {
                var blocos = service.blocos[indice];
                for (var j = 0; j < blocos.length; j++) {
                    for (var k = 0; k < blocos.length; k++) {
                        if (blocos[k].processo) continue;
                        var tam = blocos[k][0].getAttribute('lastWidth');
                        if (parseFloat(tam) >= tamanho) {
                            ultimoBloco = blocos[k];
                            break;
                        }
                    }
                }
            }
            return ultimoBloco;
        }

        function divideBloco(processo, bloco, consumo) {
            logger.memoryInfo(NAME, 'Dividindo bloco '+bloco[0].getAttribute('id'));
            var parent = bloco[0].parentNode;
            var pct = consumo * (MMU.getRowWidth()/MMU.totalLinha);
            var bl2W = bloco[0].getAttribute('lastWidth') - pct;
            var lastId = bloco[0].getAttribute('id');

            var pid = lastId+'-'+processo.pid+'-';
            var bl1 = MMU.montarBloco(pid+'1', pct, processo, consumo);
            var bl2 = MMU.montarBloco(pid+'2', bl2W, processo, 0);
     
            var node = $('#'+bloco[0].getAttribute('id'))[0];
            bl1 = $compile(bl1)(scope);
            bl1[0].setAttribute('lastWidth', pct);

            bl2 = $compile(bl2)(scope);
            bl2[0].setAttribute('lastWidth', bl2W);

            bl1.processo = processo;

            var parentId = parent.getAttribute('id');

            service.blocos[parentId].push(bl1);
            service.blocos[parentId].push(bl2);

            angular.element(parent.insertBefore(bl1[0], node));
            angular.element(parent.insertBefore(bl2[0], node));
            node.parentNode.removeChild(node);

            for (var indice in service.blocos) {
                var blocos = service.blocos[indice];
                var indice = blocos.indexOf(bloco);
                if (indice > -1) {
                    blocos.splice(indice, 1);
                    break;
                }
            }

            return bl1;
        }

        function mergeBlocks() {
            inUse = 1;
            for (var i = 0; i < 100; i+= 10) {
                var blocos = service.blocos['c'+i]
                for (var k = 0; k < blocos.length; k++) {
                    if (k+1 < blocos.length) {
                        var blocoCorrente = blocos[k];
                        var proximoBloco = blocos[k+1];
                        if (!proximoBloco.processo && !blocoCorrente.processo) {
                            var parent = blocoCorrente[0].parentNode;
                            if (parent) {
                                var id = blocoCorrente[0].getAttribute('id');
                                var id2 = proximoBloco[0].getAttribute('id');
                                logger.memoryInfo(NAME, 'Blocos mesclados');
                                blocos.splice(k+1, 1);
                                blocos.splice(k, 1);
                                
                                var consumo1 = parseFloat(blocoCorrente[0].getAttribute('lastWidth'));
                                var consumo2 = parseFloat(proximoBloco[0].getAttribute('lastWidth'));

                                var blocoMerged = MMU.montarBloco(id+'-'+id2, consumo1 + consumo2, null, 0);

                                blocoMerged = $compile(blocoMerged)(scope);
                                blocoMerged[0].setAttribute('lastWidth', consumo1+consumo2);

                                angular.element(parent.insertBefore(blocoMerged[0], blocoCorrente[0]));
                                blocoCorrente[0].parentNode.removeChild(blocoCorrente[0]);
                                proximoBloco[0].parentNode.removeChild(proximoBloco[0]);


                                blocos.splice(k, 0, blocoMerged);
                                k += 1;
                            }
                        }
                    }
                }
            }
            inUse = 0;
        }

        return self;
    }
})();