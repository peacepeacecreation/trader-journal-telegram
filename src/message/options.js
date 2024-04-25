import buttons from './buttons.js'

export default {
    pairs(ctx) {
        return ctx.session.pairs
            .reduce((res, btnName, index) => {
                if (index % 3 == 0) {
                    res.push([])
                }

                res[res.length - 1].push({
                    text: btnName,
                    callback_data: btnName,
                })

                return res
            }, [])
    },
    get() {
        return {
            reply_markup: this.getReply(arguments)
        }
    },
    getReply() {
        const args = [...arguments];
        return JSON.stringify({
            inline_keyboard: args.map((item) => this.getButtons(item))
        })
    },
    getButtons(item) {
        return item.map((name) => buttons[name])
    },
}
