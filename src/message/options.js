import buttons from './buttons.js'

export default {
    get(names1 = [], names2 = []) {
        return {
            reply_markup: this.getReply(names1, names2)
        }
    },
    getReply(names1 = [], names2 = []) {
        return JSON.stringify({
            inline_keyboard: [
                names1.map((name) => buttons[name]),
                names2.map((name) => buttons[name]),
            ]
        })
    },
}
