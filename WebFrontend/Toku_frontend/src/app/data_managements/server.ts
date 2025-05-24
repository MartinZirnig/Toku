export const Server = {
    Protocol: "http",
    SocketProtocol: "ws",
    Port: "8080",
    Domain: "localhost",

   get Url() {
    return `${Server.Protocol}://${Server.Domain}:${Server.Port}`
   },
   get SocketUrl() {
    return `${Server.SocketProtocol}://${Server.Domain}:${Server.Port}`
   }
}
