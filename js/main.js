/**
 * Created by Gabriel on 05/03/2016.
 */
var so = angular.module('so', ['ngSanitize', 'minhasDiretivas', 'ngAnimate', 'chart.js']);
so.config(function(ChartJsProvider) {
   ChartJsProvider.setOptions({
       animationSteps: 15,
       bezierCurve: false,
       animation : false,
       //Boolean - If we want to override with a hard coded scale
       scaleOverride : true,
       //** Required if scaleOverride is true **
       //Number - The number of steps in a hard coded scale
       scaleSteps : 2,
       //Number - The value jump in the hard coded scale
       scaleStepWidth : 10,
       //Number - The scale starting value
       scaleStartValue : 0});
});

var container = {

    //Fonte http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
    random : function(min, max) {
        /**
         * Returns a random integer between min (inclusive) and max (inclusive)
         * Using Math.round() will give you a non-uniform distribution!
         */
        return Math.floor(Math.random() * (max - min + 1)) + min;

    } //Fim Fonte

};

function Processo(pid, horaExecucao, tempoTotal, active) {
    var self = this;
    this.startTime = 0;
    this.endTime = 0;
    this.pid = pid;
    this.tempo = 0;
    this.tempoTotal = tempoTotal;
    this.processo = 'Processo '+pid;
    this.executado = 0;
    this.active = active;
    this.memoria = new Memoria();
    this.progress = 0;
    this.horaExecucao = horaExecucao;
    this.state = 'Pronto';
    this.prioridade;
    this.blocos = [];
    this.chance = [1, 5].indexOf(container.random(1, 10)) > -1;
    Processo.prototype.limparBlocos = function(service) {
        this.blocos.forEach(function (objetoBloco) {
            var bloco = objetoBloco.bloco;
            bloco.style.width = "0";
            objetoBloco.blocoReal.processo = undefined;
            service.config.memoria.diminuirConsumo(objetoBloco.uso, self);
            var algoritmo = service.config.memoria.algoritmo;
            algoritmo.limpeza && algoritmo.limpeza(objetoBloco.blocoReal, objetoBloco.uso);
        });
    }
}

function Configuration() {
    this.cores = 4;
    this.algoritmo = "1";
    this.quantum = 1;
    this.processos = 1;
    this.processadores = [];
    this.running = false;
    this.processadorPrincipal = {
        id: 'Principal',
        usage: [0,0,0,0,0,0],
        estado: 'Pronto'
    }
    this.memoria = new Memoria();
    this.console = new Console();
}


function Memoria() {
    this.consumo = 0;
    this.total = 100;
    this.algoritmo;

    Memoria.prototype.totalEmBytes = function() {
        return this.total * 1024;
    }
    Memoria.prototype.aumentarConsumo = function(consumo, processo, diminui) {
        if (!diminui && this.totalEmBytes() - this.consumo - consumo < 0) {
            throw "[Processo "+processo.pid+"] - OutOfMemoryException - Memoria livre: " + this.memoriaLivre().toFixed(2) + " bytes";
        } else {
            if (diminui) {
                this.consumo -= consumo;
                if (this.consumo < 0) this.consumo = 0;
            }
            else this.consumo += consumo;
        }
    }

    Memoria.prototype.diminuirConsumo = function(consumo, processo) {
        this.aumentarConsumo(consumo, processo, true);
    }

    Memoria.prototype.memoriaLivre = function() {
        return (this.total*1024 - this.consumo)
    }

    Memoria.prototype.avisarConsumo = function($rootScope, bloco) {
        $rootScope.$broadcast('memoryConsumption', {
            id: bloco.id,
            valor: bloco.progress
        });
    }
}

function Console() {
    this.log = [];
}