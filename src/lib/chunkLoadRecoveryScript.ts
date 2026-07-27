/**
 * Inline script (before React) that auto-reloads once when a webpack/Next
 * ChunkLoadError happens — common after overnight cold start of `next dev`
 * or when a restored tab has stale chunk hashes.
 */
export const CHUNK_LOAD_RECOVERY_SCRIPT = `(function(){
  var KEY='pg:chunk-reload';
  function isChunk(msg){
    if(!msg)return false;
    return /Loading chunk .+ failed/i.test(msg)
      || /ChunkLoadError/i.test(msg)
      || /Failed to fetch dynamically imported module/i.test(msg)
      || /error loading dynamically imported module/i.test(msg);
  }
  function reloadOnce(){
    try{
      var last=sessionStorage.getItem(KEY);
      if(last && Date.now()-Number(last)<10000)return;
      sessionStorage.setItem(KEY,String(Date.now()));
      location.reload();
    }catch(e){location.reload();}
  }
  window.addEventListener('error',function(e){
    if(isChunk(e.message)||isChunk(e.error&&e.error.message))reloadOnce();
  });
  window.addEventListener('unhandledrejection',function(e){
    var r=e.reason;
    var msg=typeof r==='string'?r:(r&&r.message);
    if(isChunk(msg))reloadOnce();
  });
})();`;
