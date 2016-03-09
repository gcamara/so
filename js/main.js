/**
 * Created by Gabriel on 05/03/2016.
 */
var so = angular.module('so', ['minhasDiretivas', 'ngRoute'])


var container = {

    //Fonte http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
    random : function(min, max) {
        /**
         * Returns a random integer between min (inclusive) and max (inclusive)
         * Using Math.round() will give you a non-uniform distribution!
         */
        return Math.floor(Math.random() * (max - min + 1)) + min;

    } //Fim Fonte

}
