// var myArgs = process.argv.slice(2);
var myArgs = process.argv;
console.log(myArgs[2]);
if(myArgs[2] === '1'){
    console.log('C1');
} else {
    console.log('C2');
}