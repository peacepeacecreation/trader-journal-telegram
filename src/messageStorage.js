export default {
    messageIds: [],
    ctx: null,
    set(messageId) {
        this.messageIds = [...this.messageIds, messageId]
    },
    async reply(ctx, text) {
        let { message_id } = await ctx.reply(text)
        this.set(message_id)
    },
    async finish(ctx) {
        this.ctx = null
        await setTimeout(async () => {
            this.messageIds.forEach(async (messageId) => {
                await ctx.deleteMessage(messageId)
            })

            this.messageIds = []
        }, 1000)
    },
}
