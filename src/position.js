import { rejectCommand } from './methods/index.js'
import { addRow } from './notion/index.js'
import { createMessage } from './methods/message.js'

export default {
    async init(ctx) {
        try {
            const { href } = await ctx.telegram.getFileLink(ctx.message.photo[ctx.message.photo.length - 1].file_id)


            if (!ctx.message.caption) {
                ctx.state.href = href
                ctx.scene.enter('createPosition', { href })
            } else {
                const response = await addRow(ctx, { ...rejectCommand(ctx.message.caption), href })

                await createMessage(ctx, href, response, ['edit', 'fix', 'remove'])

                await ctx.deleteMessage(ctx.message.message_id)
            }

        } catch (e) {
            console.error('Error while proccessing text: ', e.message)
        }
    },
}
