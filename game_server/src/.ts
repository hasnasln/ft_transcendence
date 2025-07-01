

// export function registerSocketAuthentication(io: Server) {
//   // .use() içindeki middleware, her yeni socket bağlantısında çalışacak:
//   io.use(async (socket: Socket, next) => {
//     try {
//       // İstemcinin connect ederken gönderdiği JWT:
//       const token = socket.handshake.auth?.token as string;
//       if (!token) {
//         return next(new Error("Unauthorized: Token eksik")); 
//       }

//       // token’ı doğrula:
//       const { payload } = await jwtVerify(token, HMAC_SECRET as KeyLike);

//       // payload’ın beklenen yapıda olup olmadığını kontrol et (örnek):
//       if (typeof (payload as any).username !== "string") {
//         return next(new Error("Unauthorized: Payload geçersiz"));
//       }

//       // Doğrulandıysa socket.data altında saklayabilirsiniz:
//       socket.data.user = { username: (payload as any).username };
//       return next(); // Geçmesine izin ver
//     } catch (err) {
//       return next(new Error("Unauthorized: Token doğrulama başarısız"));
//     }
//   });

//   // Artık, doğrulanan her socket bağlantısı aşağıdaki handler içerisine düşer:
//   io.on("connection", (socket: Socket) => {
//     console.log(`Yeni kullanıcı bağlandı: ${(socket.data.user as any).username}`);

//     socket.on("disconnect", () => {
//       console.log(`Kullanıcı ayrıldı: ${(socket.data.user as any).username}`);
//     });

//     // Örneğin bir oyun başlatma isteğini burada dinleyebilirsiniz:
//     socket.on("startGame", (data) => {
//       console.log("startGame çağrıldı, kullanıcı:", (socket.data.user as any).username);
//       // Oyun başlama mantığını buraya koyun…
//     });
//   });
// }
