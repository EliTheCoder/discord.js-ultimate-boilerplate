const config = require("../config.json");

exports.run = async (bot, msg, args) => {
  msg.channel.send(client.ping() + "ms");
  return 0;
}

exports.config = {
  names: ["ping", "pi"],
  auth: 1,
  usage: `${config.prefix}ping`
}
