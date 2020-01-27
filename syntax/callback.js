/*
function a(){
    console.log('A');
}
*/
var a = function(){ //이름이 없는 함수를 익명함수라고 함.
    console.log('A');
}

function slowfunc(callback){
    callback();
}

slowfunc(a);