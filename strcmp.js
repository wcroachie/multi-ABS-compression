/*

__compressString(string)

*/

window[new Error().stack.match(location.href.match(/(.*)\//g)+"(.*?):")[1]]=()=>{

  window.__compressString=function(input){
    var allSingleByteCharacters=(s=>{
      for(let i=0;i<128;i++){s+=String.fromCharCode(i)}
      return s;
    })("");
    var getPairs=(input)=>{
      return input.match(/(.|[\r\n]){1,2}/g).concat(input.slice(1).match(/(.|[\r\n]){1,2}/g));
    };
    var getUnusedCharacters=(input)=>{
      var unused="";
      allSingleByteCharacters.split("").forEach((each)=>{
        if(input.indexOf(each)<0){unused+=each}
      });
      return unused;
    };
    var getMostCommon=(arr)=>{
      var hashMap=arr.reduce((acc,val)=>{
        acc[val]=(acc[val]||0)+1;
        return acc;
      },{});
      return Object.keys(hashMap).reduce((a,b)=>hashMap[a]>hashMap[b]?a:b);
    };
    var run=(input)=>{
      var startTime = performance.now();
      var replacers = getUnusedCharacters(input).split("");
      var step = (str,app)=>{
        var replacer      = replacers.pop();
        var replacee      = getMostCommon(getPairs(str));
        var newString     = str.replaceAll(replacee,replacer);
        var newAppendix   = String(replacer)+String(replacee)+String(app);
        return [newString,newAppendix];
      };
      var workingString   = input;
      var workingAppendix = "";
      var res             = "";
      var versions        = [];
      do{
        var gen         = step(workingString,workingAppendix);
        workingString   = gen[0];
        workingAppendix = gen[1];
        var currLength  = JSON.stringify(workingString).length+JSON.stringify(workingAppendix).length;
        versions.push([gen[0],gen[1],currLength]);
      }while(replacers.length);
      var smallestVersion = versions.reduce((a,b)=>a[2]<b[2]?a:b);
      res = [smallestVersion[0],smallestVersion[1]];
      var result=`((a,b)=>{do{a=a.replaceAll(b.shift(),b.shift()+b.shift())}while(b.length);return a})(${JSON.stringify(res[0])},[...${JSON.stringify(res[1])}])`;
      var endTime=performance.now();
      console.info("time taken to compress: "+(endTime-startTime));
      return result.length<input.length?result:input;
    };
    return run(input);
  };
  
};
