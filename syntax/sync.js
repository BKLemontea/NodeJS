var fs = require('fs');

/*
//readFileSync
// 동기 방식
console.log('A');
var result = fs.readFileSync('syntax/sample.txt', 'utf8');
console.log(result);
console.log('C');
*/

// 비동기 방식
console.log('A');
fs.readFile('syntax/sample.txt', 'utf8', function(err, result){ // 비동기 방식은 콜백함수를 필요로함.
    console.log(result);
});
console.log('C');