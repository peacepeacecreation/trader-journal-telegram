import { template } from '../message/index.js'
import buttons from '../message/options.js'

export async function createMessage (ctx, href, response, btns = ['edit']) {
    await ctx.replyWithPhoto(
        { url: href },
        {
            caption: template(response),
            parse_mode: 'Markdown',
            reply_markup: buttons.getReply(btns)
        },
    )

    return true
}

export async function editMessage (ctx, response, btns = ['edit']) {
    await ctx.editMessageCaption(
        template(response),
        {
            parse_mode: 'Markdown',
            reply_markup: buttons.getReply(btns)
        }
    )
}
