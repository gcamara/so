/**
 * Created by Gabriel on 20/05/2016.
 */

var so = angular.module('so');

so.filter('range', limitador);
function limitador() {
    return function(input, total) {
        total = parseInt(total);

        for (var i = 0; i < total; i++) {
            input.push(i);
        }

        return input;
    }
}