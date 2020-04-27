function sqsMessageHandler (handler) {
  return (message) => {
    message.Body = JSON.stringify(message.contents)
    console.log(message)
    return handler(message)
  }
}

module.exports = sqsMessageHandler
