exports.execute = (message) => {
    let Snipes = message.client.Snipes[message.channel.id] || [];
    if (Snipes.length >= 5) {
        Snipes.shift();
        Snipes.push({
            Writer: `${message.author.tag} (${message.author.id})`,
            Content: message.content ? message.content : null,
            DeletedAt: Date.now(),
            Image: message.attachments.size > 0 ? message.attachments.array()[0].proxyURL : null
        });
    } else {
        Snipes.push({
            Writer: `${message.author.tag} (${message.author.id})`,
            Content: message.content ? message.content : null,
            DeletedAt: Date.now(),
            Image: message.attachments.size > 0 ? message.attachments.array()[0].proxyURL : null
        });
    }
    message.client.Snipes[message.channel.id] = Snipes;
};

exports.conf = {
    event: "messageDelete",
    enabled: true
};
