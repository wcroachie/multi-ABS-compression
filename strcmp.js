!function(globalScope){try{globalScope[new Error().stack.match(location.href.match(/(.*)\//g)+"(.*?):")[1].replace(/\?(.*)/,"")]=arguments.callee;

  var worker = new Worker(URL.createObjectURL(new Blob([`
    !function(){

      const allSingleByteCharacters =  (s=>{for(let i=0;i<128;i++){s+=String.fromCharCode(i)}return s})("");

      function getPairs(inp){
        return inp.match(/(.|[\\r\\n]){1,2}/g).concat(inp.slice(1).match(/(.|[\\r\\n]){1,2}/g))
      }

      function getUnusedChars(inp){
        var unused="";
        allSingleByteCharacters.split("").forEach((each)=>{
          if(inp.indexOf(each)<0){unused+=each}
        });
        return unused;
      }

      function getMostCommon(arr){
        var hashMap=arr.reduce((acc,val)=>{
          acc[val]=(acc[val]||0)+1;
          return acc;
        },{});
        return Object.keys(hashMap).reduce((a,b)=>hashMap[a]>hashMap[b]?a:b);
      }

      function run(inp){

          var replacers = getUnusedChars(inp).split("");

          var step = (str,app)=>{
            var replacer      = replacers.pop();
            var replacee      = getMostCommon(getPairs(str));
            var newString     = str.replaceAll(replacee,replacer);
            var newAppendix   = String(replacer)+String(replacee)+String(app);
            return [newString,newAppendix];
          };

          var workingString   = inp;
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
          var result=\`((a,b)=>{do{a=a.replaceAll(b.shift(),b.shift()+b.shift())}while(b.length);return a})(\${JSON.stringify(res[0])},[...\${JSON.stringify(res[1])}])\`;
          
          return result.length<inp.length?result:inp;
      }

      onmessage=(e)=>{
        // echo back id
        var id      = e.data[0];
        var content = e.data[1];
        postMessage([id,run(content)]);
      };

    }()
  `],{type:"application/javascript"})));


  console.warn("string compression worker started at "+performance.now()+"ms after page load.");


  function compressString(input,callback){
    var tick = -performance.now();
    var id=crypto.randomUUID();
    worker.postMessage([id,input]);
    worker.onmessage=(e)=>{
      if(e.data[0]===id){
        var output=e.data[1];
        tick += performance.now();
        console.warn(input.length+"bytes");
        console.warn(output.length+"bytes");
        console.warn("compression took "+tick+"ms");
        callback(output);
      }
    };
  }

  !function(){/* export to global scope */
    globalScope.__compressString = compressString;
  }()


}catch(e){if(typeof onerror==="function"){onerror(String(e),e.stack.split(/:(\d*?):/)[0],e.stack.match(/:(\d*?):/)[1],null,e)}else{throw e}}}(window)
