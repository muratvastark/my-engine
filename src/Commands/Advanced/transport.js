const { GuildMember, VoiceChannel, MessageEmbed } = require("discord.js");

exports.run = async (Moderation, message, args) => {
  if (message.member.check(Moderation.Defaults.TransportAuthRoles) === false) return;
 
  const victim = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
  if (!args[0] || !victim || victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("Geçerli bir üye belirt!");
  if (!victim.voice.channelID) return message.channel.send("Taşınacak üye bir ses kanalında değil!");
  
  const target = message.mentions.members.array()[1] || message.guild.members.cache.get(args[1]) || message.guild.channels.cache.find(x => x.type == "voice" && x.id == args[1]);
  if (!args[1] || !target) return message.channel.send("Geçerli bir üyeyi veya ses kanalı belirt!");
  
  const isMember = target instanceof GuildMember;
  if (isMember && !target.voice.channelID) return message.channel.send("Hedef üye bir ses kanalında değil!");
  else if (isMember && target.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("Hedef üye senden daha üstte bir role sahip!");
  
  if (victim.voice) victim.voice.setChannel(isMember ? target.voice.channelID : target.id);
  message.channel.send(new MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic:true })).setColor("RANDOM").setDescription(`${victim.toString()} üyesi başarı ile **${target.toString()}** ${isMember ? `üyesinin ses kanalına (**${target.voice.channel.name}**) taşındı.` : `ses kanalında taşındı!`}`));
};

exports.conf = {
    commands: ["taşı", "tp", "teleport", "transport", "tasi", "tası", "taşi"],
    enabled: true,
    usage: "taşı @üye (@hedef üye/ses kanalı ID)",
};