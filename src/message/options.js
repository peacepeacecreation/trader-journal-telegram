import buttons from './buttons.js'

export default {
    get(names1 = [], names2 = []) {
        return {
            reply_markup: this.getReply(names1)
        }
    },
    getReply(names1 = []) {
        return JSON.stringify({
            inline_keyboard: [
                names1.map((name) => buttons[name]),
            ]
        })
    },
}
