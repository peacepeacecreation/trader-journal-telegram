import buttons from './message/options.js'
import { editMessage } from './methods/message.js'
import { updateState, updateFix, updateRisk, updateRR } from './notion/index.js'
import strMessage from './ClearMessage.js'

const callback = (method) => {
    return {
        callback: async (done) => await method(done)
    }
}

export default async function (ctx) {
    try {
        const { message, data } = ctx.update.callback_query

        switch (data) {
            case 'exit':
                // await ctx.scene.leave()
                // await strMessage.clear(ctx, false)
                await ctx.editMessageReplyMarkup(buttons.getReply(['edit']))

                break
            case 'cancel':
                ctx.scene.leave()
                await ctx.editMessageReplyMarkup(buttons.getReply(['edit']))
                break
            case 'edit_data':
                await ctx.editMessageReplyMarkup(buttons.getReply(['edit_state', 'edit_risk', 'edit_rr', 'edit_pair'], ['exit']))
                break
            case 'edit_state':
                await ctx.editMessageReplyMarkup(buttons.getReply(['target', 'stop', 'be'], ['exit']))
                break

            case 'edit_pairs':
                await ctx.scene.enter('editPairs', callback(async (done) => {
                    if (done) {
                        console.log(ctx)
                    }
                }))

                break

            case 'edit_risk':
                ctx.editMessageReplyMarkup(buttons.getReply(['cancel']))

                await ctx.scene.enter('editRisk', callback(async (done) => {
                    if (done) {
                        const response = await updateRisk(ctx, ctx.scene.state.risk)
                        return await editMessage(ctx, response, ['edit'])
                    }
                }))
                break
            case 'edit_rr':
                ctx.editMessageReplyMarkup(buttons.getReply(['cancel']))

                await ctx.scene.enter('editRR', callback(async (done) => {
                    if (done) {
                        const response = await updateRR(ctx, ctx.scene.state.rr)
                        return await editMessage(ctx, response, ['edit'])
                    }
                }))
                break
            case 'fix':
                ctx.editMessageReplyMarkup(buttons.getReply(['cancel']))

                await ctx.scene.enter('fix', callback(async (done) => {
                    if (done) {
                        const { rr, percent } = ctx.wizard.state

                        const response = await updateFix(ctx, { rr, percent })
                        return await editMessage(ctx, response, ['edit'])
                    }
                }))

                break

            case 'target':
            case 'loss':
            case 'be':
                const response = await updateState(ctx, data)
                await editMessage(ctx, response, ['edit'])

            case 'edit':
                ctx.editMessageReplyMarkup(buttons.getReply(['fix', 'edit_data']))
                break
        }
    } catch (err) {
        console.log('Error callback query: ', err.message)
    }
}
