const { PenalModel } = require("../Helpers/models.js");

exports.execute = (oldState, newState) => {
    if (!newState.member.voice.channelID || !newState.member.manageable) return;
    PenalModel.find({ User: newState.member.id, Type: "VOICE_MUTE", Complated: false }, (err, datas) => {
        if (!datas || !datas.length || err) return;
        datas.forEach((data) => {
            if (data.Activity === true && !newState.member.voice.serverMute) newState.member.voice.setMute(true).catch(console.error);
            if (data.Activity === false) {
                if (newState.member.voice.serverMute) newState.member.voice.setMute(false).catch(console.error);
                data.Complated = true;
                data.save();
            }
        });
    });
};

exports.conf = {
    event: "voiceStateUpdate",
    enabled: true
};