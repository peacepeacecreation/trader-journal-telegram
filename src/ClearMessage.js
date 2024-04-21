const remove = (ctx, messages) => {
    if (!(messages && messages.length > 0)) return

    ctx.deleteMessages(
        messages
            .filter((item) => item && item.message_id)
            .map(({ message_id: id }) => id)
    )
}

export default {
    clear: async (ctx, save = true) => {
        const { messages, callback } = ctx?.wizard?.state || ctx.scene.state

        if (callback) await callback(save)

        save
            ? setTimeout(() => remove(ctx, messages), 1500)
            : remove(ctx, messages)
    },
    set: async (ctx, text, params = null) => {
        if (!ctx.scene.state.messages) ctx.scene.state.messages = []

        if (!text) {
            if (ctx.message)
                ctx.scene.state.messages.push(ctx.message)
        } else {
            ctx.scene.state.messages.push(await ctx.reply(text, params))
        }
    }
}
