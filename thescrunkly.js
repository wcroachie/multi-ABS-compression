
/* Multi-level adjacent-bytes substitution (multi-ABS) */
function multiABS( str, isSelfEvaluatable=false ){

  if( /\x00/.test(str) ){
    throw "the provided string contains a null byte \\x00"
  }
  
  let unusedSingleByteCharacters = function(){
    let unused="";
    "0".repeat(128).replace(/./g,(a,b)=>String.fromCodePoint(b)).split("").forEach(char=>{
      if(str.indexOf(char)<0){unused+=char}
    });
    return unused;
  }();
  
  function getPairCounts( str ){
    let counts = {};
    let pairs = str.match(/..?/g);
    pairs.forEach(pair=>{
      if( pair in counts ){
        counts[pair] = counts[pair] + 1;
      }else{
        counts[pair] = 0;
      }
    });
    let entries = Object.entries(counts);
    let sorted = entries.sort((a,b)=>b[1]-a[1]);
    return sorted;
  }
  
  let key = [];
  
  str = str.replace(/\*/g,"\x00");
  
  function cycle(){
    if( !unusedSingleByteCharacters.length ){
      throw "";
    }
    let len = str.length;
    let mostCommonPair = getPairCounts( str )[0][0];
    let substitute = unusedSingleByteCharacters[0];
    unusedSingleByteCharacters = unusedSingleByteCharacters.slice(1);
    key.push([substitute,mostCommonPair]);
    let regexp = string_toRegExp(mostCommonPair,"g");
    str = str.replace( regexp, substitute );
    if( str.length >= len ){
      throw "";
    }
  }
  for( ;; ){
    let _str = str;
    try{
      cycle();
    }catch(e){
      str = _str;
      break;
    }
  }
  let comment1 = "/*" + str + "*/";
  let comment2 = "/*" + key.map(e=>e[0]+e[1]+"").join("") + "*/";
  let blob = 
    isSelfEvaluatable ? new Blob([`eval((()=>{let a=(()=>{${comment1}${comment2}})+"",b=a.match(/\\/\\*(.*?)\\*\\//gs).map(e=>e.slice(2,-2));a=b[0];let k=b[1].match(/.../gs).map(e=>[e[0],e[1]+e[2]]),p;while(k.length){p=k.pop();a=a.split("").map(e=>e===p[0]?p[1]:e).join("")}a=a.replace(/\\x00/g,"*");return a;})())`],{type:"application/javascript"}) 
    : new Blob([`(()=>{let a=(()=>{${comment1}${comment2}})+"",b=a.match(/\\/\\*(.*?)\\*\\//gs).map(e=>e.slice(2,-2));a=b[0];let k=b[1].match(/.../gs).map(e=>[e[0],e[1]+e[2]]),p;while(k.length){p=k.pop();a=a.split("").map(e=>e===p[0]?p[1]:e).join("")}a=a.replace(/\\x00/g,"*");return a;})()`],{type:"text/plain"});
  return blob;
}
