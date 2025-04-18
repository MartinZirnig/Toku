export const Server = {
    Protocol: "http",
    Port: "8080",
    Domain: "localhost",

   get Url() {
    return `${Server.Protocol}://${Server.Domain}:${Server.Port}`
   }
}
