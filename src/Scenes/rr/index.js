import strMessage from '../../ClearMessage.js'
import alowCallbackQueryScene from '../../methods/alowCallbackQueryScene.js'

export default {
    async enter(ctx) {
        await alowCallbackQueryScene(ctx, async () => {
            strMessage.set(ctx)
            await strMessage.set(ctx, 'Введіть RR:', { reply_to_message_id: ctx.scene.state.messageId })
        })
    },
    async text(ctx) {
        strMessage.set(ctx)
        const currRR = Number(ctx.message.text)

        if (currRR && currRR > 0) {
            ctx.scene.state.rr = currRR;

            strMessage.set(ctx, 'RR збережено')
            await strMessage.clear(ctx)
            ctx.scene.leave()
        } else {
            strMessage.set(ctx, 'Потрібно ввести кількість RR')
            ctx.scene.reenter()
        }
    },
    async callbackQuery(ctx) {
        return await alowCallbackQueryScene(ctx)
    },
}
