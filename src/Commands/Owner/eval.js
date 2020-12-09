exports.run = async (client, message, args) => {
    // if (!client.Defaults.Developers.includes(message.author.id)) return;
    if (!args[0]) return;
    const code = args.join(" ");
    function clean(text) {
        if (typeof text !== "string") text = require("util").inspect(text, { depth: 0 });
        text = text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        return text;
    }
    try {
        var evaled = clean(await eval(code))
        message.channel.send(`${evaled.replace(new RegExp(client.token, "g"), "Verdim tokeni hissettin mi kardeşim")}`, { code: "js", split: true });
    } catch (err) {
        message.channel.send(err, { code: "js", split: true });
    }
};

exports.conf = {
    commands: ["eval", "ev", "hewal", "avel"],
    enabled: true,
    usage: "eval"
};
