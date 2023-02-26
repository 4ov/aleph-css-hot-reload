const sources = [...document.querySelectorAll('link[rel="stylesheet"]')].map(link=>new URL(link.href).pathname)
const wsUrl = new URL(`ws://${location.host}/__hotcss`)
sources.forEach(s=>wsUrl.searchParams.append("files", s))
const socket = new WebSocket(wsUrl)

socket.onmessage = (ev)=>{
    const { content, file } = JSON.parse(ev.data)
    const stylesheet = document.querySelector(`style[data-path="${file}"]`)
    if(stylesheet){
        stylesheet.textContent = content
    }else{
        const newStylesheet = document.createElement("style")
        newStylesheet.dataset.path = file
        newStylesheet.textContent = content
        document.head.appendChild(newStylesheet)
    }
}
console.log(socket);
