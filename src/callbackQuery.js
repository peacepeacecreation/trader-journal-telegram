import buttons from './message/options.js'
import { editMessage } from './methods/message.js'
import { updateState, updateFix, updateRisk, updateRR, updatePair } from './notion/index.js'
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
                await ctx.editMessageReplyMarkup(buttons.getReply(['edit', 'fix', 'remove']))
                break

            case 'cancel':
                await ctx.editMessageReplyMarkup(buttons.getReply(['edit', 'fix', 'remove']))
                break

            case 'edit_state':
                await ctx.editMessageReplyMarkup(buttons.getReply(['target', 'stop', 'be'], ['exit']))
                break

            case 'edit_pair':
                await ctx.scene.enter('editPair', callback(async (done) => {
                    if (done) {
                        const response = await updatePair(ctx, ctx.scene.state.pair)
                        return await editMessage(ctx, response, ['edit', 'fix', 'remove'])
                    }
                }))
                break

            case 'add_new_pair':
                await ctx.scene.enter('addNewPair', callback(async (done) => {
                    if (done) {
                        const response = await updatePair(ctx, ctx.state.pair)
                        return await editMessage(ctx, response, ['edit', 'fix', 'remove'])
                    }
                }))
                break

            case 'edit_existing_pair':
                await ctx.scene.enter('editExistingPair')
                break

            case 'edit_risk':
                ctx.editMessageReplyMarkup(buttons.getReply(['cancel']))

                await ctx.scene.enter('editRisk', callback(async (done) => {
                    if (done) {
                        const response = await updateRisk(ctx, ctx.scene.state.risk)
                        return await editMessage(ctx, response, ['edit', 'fix', 'remove'])
                    }
                }))
                break

            case 'edit_rr':
                ctx.editMessageReplyMarkup(buttons.getReply(['cancel']))

                await ctx.scene.enter('editRR', callback(async (done) => {
                    if (done) {
                        const response = await updateRR(ctx, ctx.scene.state.rr)
                        return await editMessage(ctx, response, ['edit', 'fix', 'remove'])
                    }
                }))
                break
            case 'fix':
                ctx.editMessageReplyMarkup(buttons.getReply(['cancel']))

                await ctx.scene.enter('fix', callback(async (done) => {
                    if (done) {
                        const { rr, percent } = ctx.wizard.state

                        const response = await updateFix(ctx, { rr, percent })
                        return await editMessage(ctx, response, ['edit', 'fix', 'remove'])
                    }
                }))

                break

            case 'target':
            case 'loss':
            case 'be':
                const response = await updateState(ctx, data)
                await editMessage(ctx, response, ['edit', 'fix', 'remove'])

            case 'edit':
                await ctx.editMessageReplyMarkup(buttons.getReply(['edit_state', 'edit_risk', 'edit_rr', 'edit_pair'], ['exit']))
                break

            case 'remove':
                ctx.editMessageReplyMarkup(buttons.getReply(['cancel']))

                await ctx.scene.enter('removePosition', callback(async (done) => {
                    if (!done) {
                        await ctx.editMessageReplyMarkup(buttons.getReply(['edit', 'fix', 'remove']))
                    }
                }))
                break
        }
    } catch (err) {
        console.log('Error callback query: ', err.message)
    }
}
