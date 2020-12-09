const { MessageEmbed } = require("discord.js");
const fs = require("fs");

exports.run = async (Moderation, message, args) => {
    if (message.guild.ownerID !== message.author.id) return;
    const Embed = new MessageEmbed().setColor("RANDOM").setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));
    const Tag = args[0];
    let BannedTags = Moderation.Defaults.BannedTags;
    if (!Tag) return message.channel.send(Embed.setDescription("Yasaklı taglara eklemek/kaldırmak için bir tag belirtmelisin!").addField("Yasaklı Taglar", BannedTags.length ? BannedTags.map(_tag => `\`${_tag}\``).join("\n") : "Bulunamadı!"));
    if (BannedTags.some(_tag => _tag.includes(Tag))) {
      Moderation.Defaults.BannedTags = BannedTags.filter(_tag => !_tag.includes(Tag));
      const NewObject = {
        "Defaults": Moderation.Defaults,
        "Permissions": Moderation.Permissions,
        "Invite": require("../../../global.json").Invite
      };
      fs.writeFile("global.json", JSON.stringify(NewObject), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(Embed.setDescription(`\`${Tag}\` yasaklı taglardan kaldırıldı!`));
    } else {
      Moderation.Defaults.BannedTags.push(`${Tag}`);
      const NewObject = {
        "Defaults": Moderation.Defaults,
        "Permissions": Moderation.Permissions,
        "Invite": require("../../../global.json").Invite
      }
      fs.writeFile("global.json", JSON.stringify(NewObject), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(Embed.setDescription(`\`${Tag}\` yasaklı taglara eklendi!`));
    }
};
exports.conf = {
    commands: ["yasaklı-tag", "yasaklıtag", "bannedtags", "banned-tags"],
    enabled: true,
    usage: "yasaklı-tag [Tag]"
};