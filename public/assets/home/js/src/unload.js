
export default function (){
  window.addEventListener('beforeunload', function(e){
    let startTime = performance.now();
    // 测试浏览器兼容
    if (!navigator.sendBeacon) return true;
    
    // 发送请求的目标 URL
    let url = '/v1/home/unload-beacon';

    // 要发送的数据
    let data = new FormData();
    data.append('start', startTime);
    data.append('end', performance.now());
    data.append('url', document.URL);

    // 发送请求
    navigator.sendBeacon(url, data);
  });
}
