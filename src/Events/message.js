const { WebhookClient, MessageEmbed } = require("discord.js");
const Moderation = global.Moderation;
const { UnregisterRoles, BannedTagsRole, Prefix, Developers, Tag, ChatChannel, PermCommands, CommandLogChannel } = Moderation.Defaults;
const { Jail, Suspect } = Moderation.Permissions;
const WaitLimit = new Set();
let Count = 0;
const Compliments = [
    "dünyanın 8. harikası olma ihtimalin var mı?",
    "fıstık naber?",
    "bir gülsene cenneti merak ediyorlarmış.",
    "çok yorulmuş olmalısın. Bütün gün aklımda dolaşıp durdun.",
    "gökyüzünde yıldız olsam ilk sana kayardım.",
    "seni bir yerden çıkarıyor gibiyim.. Kalbime uğramış mıydın?",
    "seni sevmek elmayı yemekle baslar, ayvayı yemekle biter.",
    "ona kalbimi verdim saklasın diye, salak buzdolabına koymuş bozulmasın diye.",
    "sabahları kahvaltı yapmıyorum çünkü seni düşünüyorum. Öğlenleri yemek yemiyorum çünkü seni düşünüyorum. Gece olunca uyuyamıyorum çünkü açım.",
    "her derde deva olan şey; sarımsak mıydı, Yoksa sana sarılmak mıydı?",
    "sana dünyanın en tatlı, en şirin, en özel, en değerli hediyesini gönderecektim ama postacı bana kızdı ve çık o paketin içinden dedi.",
    "hani derler ya dünyada 7 harika var, sen 8. olabilirsin.",
    "şimdi sana yürüsem ne yapabilirsin he?",
    "karıncalar göbüşünü yesin senin :P",
    "belki biraz seni kıskanmış olabilirimmm. Ama çok harikasın neden kıskanmayayım :(",
    "bana kalbine giden yolu tarif eder misin?",
    "bir yemeğe çıksak mı seninle?",
    "romantik bir yemeğe ne dersin?",
    "seni seviyorum. Je t'aime. Ich liebe dich. Aishiteru. Kocham cie. Ya lyublyu tebya.",
    "seni bir yemeğe çıkarabilir miyim?",
    "galiba senden hoşlanıyorum.",
    "aşkımıza kimse engel olamaz.",
    "bi sarılsak mı ya sana ihtiyacım var",
    "çok sinirliendim ama seni görünce pamuk gibi oldum be."
];

exports.execute = async(message) => {
    if (message.content.toLowerCase().startsWith('!tag') || message.content.toLowerCase().startsWith('.tag') || message.content.toLowerCase().startsWith('?tag') || message.content === "tag") return message.channel.send(Tag);
    if (message.content.toLowerCase().startsWith('!link') || message.content.toLowerCase().startsWith('.link')) return message.channel.send(message.guild.vanityURLCode ? `discord.gg/${message.guild.vanityURLCode}` : `discord.gg/${(await message.channel.createInvite()).code}`);

    if ((!message.guild && message.channel.type === "dm") || [Jail.Role, Suspect.Role, BannedTagsRole, ...UnregisterRoles].some((role) => message.member.roles.cache.has(role))) return;

    if (message.content.startsWith(Prefix) && !WaitLimit.has(message.author.id)) {
        const Args = message.content.slice(Prefix.length).trim().split(' ');
        const CommandName = Args.shift().toLowerCase();
        const CommandLog = Moderation.channels.cache.get(CommandLogChannel);
        const Embed = new MessageEmbed();
        let Command = Moderation.Commands.find((x) => x.conf.commands.includes(CommandName)) || null;
        if (Command) {
            if (Command.conf.enabled === false && !Developers.includes(message.author.id)) return;
            Command.run(message.client, message, Args);
            if (CommandLog) CommandLog.send(Embed.setDescription(`${message.author} (\`${message.author.tag}\` - \`${message.author.id}\`) adlı kullanıcı **${Command.conf.commands[0]}** kodunu kullandı. (**\`${message}\`**)`));
        } else {
            Command = PermCommands.find((perm) => perm.Usages.includes(CommandName));
            if (Command) {
                if (message.member.check(Command.UsePeople) === false) return;
                const Member = message.mentions.members.first() || message.guild.members.cache.get(Args[0]);
                if (!Member) return message.channel.send("Lütfen geçerli bir üye belirt!");
                const Roles = Command.Roles;
                message.channel.send(Embed.setColor("RANDOM").setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true })).setDescription(`${Roles.map(role => `\`${role}\``).join(",")} ${Roles.length > 1 ? "rolleri" : "rolü"} başarıyla ${Member} adlı ${Roles.some(role => Member.roles.cache.has(role)) ? "üyeden **alındı**" : "üyeye **verildi**"}.`))
                if (CommandLog) CommandLog.send(Embed.setDescription(`${message.author} (\`${message.author.tag}\` - \`${message.author.id}\`) adlı kullanıcı **${Command.Usages[0]}** kodunu kullandı. (**\`${message}\`**)`));
                if (Roles.some(role => Member.roles.cache.has(role))) Member.roles.remove(Roles);
                else Member.roles.add(Roles);
            }
        }

        if (Command) {
            WaitLimit.add(message.author.id);
            setTimeout(() => {
                WaitLimit.delete(message.author.id);
            }, 1000);
            return;
        }
    }

    if (!message.author.bot && !message.content.startsWith(Prefix) && message.content.length > 5 && message.channel.id === ChatChannel) {
        Count++;
        if (Count <= 100) return;
        Count = 0;
        if (!message.author.username.includes(Tag)) return message.reply(`aklıma geliyorsun, tamam. Rüyama geliyorsun ona da tamam. Eeee, çarkına tükürdüğüm neden tagıma gelmiyorsun? (**\`${Tag}\`**)`);
        else message.reply(Compliments[Math.floor(Math.random() * Compliments.length)]);
    }
};

exports.conf = {
    event: "message",
    enabled: true
};