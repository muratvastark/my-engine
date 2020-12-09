const Moderation = global.Moderation;
const { VoiceChannelID, Status } = Moderation.Defaults;

exports.execute = () => {
    const VoiceChannel = Moderation.channels.cache.get(VoiceChannelID);
    if (VoiceChannelID && VoiceChannel) VoiceChannel.join();
    Moderation.user.setPresence({
        activity: {
            name: Status,
            type: "WATCHING"
        }
    });
};

exports.conf = {
    event: "ready",
    enabled: true
};
