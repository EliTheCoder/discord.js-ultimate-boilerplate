const Discord = require("discord.js");
const fs = require("fs");
const eliapi = require("eliapi");
const InsultCompliment = require("insult-compliment");
const tags = require("./tags.json");


const config = require("./config.json");
const client = new Discord.Client();
client.login(config.token);
eliapi.log(0, `logged in`);

client.commands = new Discord.Collection();

const shutdown = InteruptCode => {
  client.destroy();
  eliapi.log(0, `shuting down: ${InteruptCode}`);
}

fs.readdir('./commands/', (err, files) => {
  if (err) eliapi.log(2, err);

  let jsfiles = files.filter(f => f.split('.').pop() === 'js');
  if (jsfiles.length <= 0) {
    return eliapi.log(2, 'No commands found')
  } else {
    eliapi.log(0, `${jsfiles.length} commands found.`)
  }

  jsfiles.forEach((f, i) => {
    let cmds = require(`./commands/${f}`);
    cmds.config.names.forEach((name, i) => {
      client.commands.set(cmds.config.names[i], cmds);
    });
    eliapi.log(0, `Command ${f} loaded`);
  })
});

client.on("message", async msg => {

  if (msg.channel.type != "text") return;

  if (config.admins.indexOf(msg.author.id) != -1) {
    msg.author.auth = 4;
  } else if (msg.member.hasPermission("ADMINISTRATOR")) {
    msg.author.auth = 3;
  } else if (msg.member.hasPermission("MANAGE_MESSAGES")) {
    msg.author.auth = 2;
  } else {
    msg.author.auth = 1;
  }

  eliapi.log(4, `${msg.guild.name}: #${msg.channel.name}: (${msg.author.auth})<${msg.author.username}> ${msg.content}`);

  if (!msg.content.startsWith(config.prefix)) return;

  let content = msg.content.slice(config.prefix.length).split(" ");
  let args = content.slice(1);

  let cmd = client.commands.get(content[0]);

  if (cmd) {
    if (msg.author.auth >= cmd.config.auth) {
      let output = await cmd.run(client, msg, args)
        .catch(err => {
          eliapi.log(2, err);
          config.admins.forEach(admin => {
            client.users.get(admin).send(err);
          })
        })
      if (output != 0) {
        msg.reply(`Error: ${output} \n Usage:  ${cmd.config.usage}`)
          .then(mesg => mesg.delete(8000));
      }
    } else {
      msg.channel.send(":x: Insufficient permissions");
    }
    return;
  }
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
