function notificationHandler(io) {
  const NotificationNameSpace = io.of("/notification");

  NotificationNameSpace.on("connection", matchToDepartments);

  // Methods

  async function matchToDepartments(socket) {
    // socket.io event returns socket object

    const department = socket.handshake.query.department;
    socket.join(department);

    socket.emit("updates", `Connected to room ${department}`);
  }
}

module.exports = { notificationHandler };
