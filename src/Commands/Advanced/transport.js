const { GuildMember, VoiceChannel, MessageEmbed } = require("discord.js");

exports.run = async (Moderation, message, args) => {
  if (message.member.check(Moderation.Defaults.TransportAuthRoles) === false) return;

  let victim = message.mentions.members.first() || message.guild.member(args[0]);
  if (!args[0] || !victim) return message.channel.send("Taşınacak üyeyi etiketle!");
  if (!victim.voice.channelID) return message.channel.send("Taşınacak üye bir ses kanalında değil!");
  else if (victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("Taşınacak üye senden daha yetkili!");
  
  let target = message.mentions.members.array()[1] || message.guild.member(args[1]) || message.guild.channels.cache.find(x => x.type == "voice" && x.id == args[1]) || message.guild.channels.cache.find(x => x.type == "voice" && x.name.toLowerCase().includes(args.splice(1).join(" ").toLowerCase()));
  if (!args[1] || !target) return message.channel.send("Hedef üyeyi veya ses kanalını belirt! (ID veya isim ile)");
  
  let isMember = target instanceof GuildMember;
  
  if (isMember && !target.voice.channelID) return message.channel.send("Hedef üye bir ses kanalında değil!");
  else if (isMember && target.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("Hedef üye senden daha üstte bir role sahip!");
  
  victim.voice.setChannel(isMember ? target.voice.channelID : target.id).catch();
  message.channel.send(new MessageEmbed().setColor("RANDOM").setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true })).setDescription(`${message.author} tarafından, ${victim} üyesi ${target instanceof GuildMember ? `üyesinin ses kanalına (**${target.voice.channel.name}**) taşındı.` : `ses kanalında taşındı!`}`));
};

exports.conf = {
    commands: ["taşı", "tp", "teleport", "transport", "tasi", "tası", "taşi"],
    enabled: true,
    usage: "taşı @üye (@hedef üye/ses kanalı ID)",
};
