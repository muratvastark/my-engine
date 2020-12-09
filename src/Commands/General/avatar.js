const { MessageAttachment } = require("discord.js");

exports.run = async (Moderation, message, args) => {
    let User = message.mentions.users.first() || Moderation.users.cache.get(args[0]) || null;
    if (!User) try { User = await Moderation.users.fetch(args[0]) } catch (err) { User = message.author; }

    message.channel.send(new MessageAttachment(User.avatarURL({ dynamic: true, size: 128 })));
};

exports.conf = {
    commands: ["avatar", "av"],
    enabled: true,
    usage: "avatar [Kullanıcı]"
};