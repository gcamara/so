/**
 * Created by Gabriel on 05/03/2016.
 */
var so = angular.module('so', ['minhasDiretivas', 'ngAnimate', 'chart.js']);
so.config(function(ChartJsProvider) {
   ChartJsProvider.setOptions({
       animationSteps: 15,
       bezierCurve: false,
       animation : false,
       //Boolean - If we want to override with a hard coded scale
       scaleOverride : true,
       //** Required if scaleOverride is true **
       //Number - The number of steps in a hard coded scale
       scaleSteps : 1,
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
