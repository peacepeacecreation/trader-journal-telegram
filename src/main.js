import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import config from 'config'

import { create, remove, updateState } from './notion.js'
import { deleteMessage, updateStateMessage, updateFixMessage, updateRiskMessage, updateRRMessage } from './methods.js'
import messageStorage from './messageStorage.js'
import { template } from './message/index.js'
import buttons from './message/options.js'
import KEYS from './message/keys.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'), {
    handlerTimeout: Infinity,
})

bot.telegram.setMyCommands([
    {
        command: 'risk',
        description: 'set risk',
    },
]);

let status = null
let fix = 0

let risk = {
    state: false,
    value: 0.5,
}

bot.command('risk', async ctx => {
    risk.state = true;
    messageStorage.set(ctx.message.message_id)
    messageStorage.reply(ctx, 'Введіть ризик:')
})

bot.on(message('text'), async (ctx) => {
    const { text } = ctx.message

    if (risk.state) {
        if (!Number.isNaN(Number(text)))
            risk.value = Number(text)

        risk.state = false;

        messageStorage.set(ctx.message.message_id)
        messageStorage.reply(ctx, `Ризик змінено на ${risk.value}%`)
        messageStorage.finish(ctx)

        return;
    }

    if (status == 'FIX1') {
        if (!Number.isNaN(Number(text))) {
            fix = Number(text) * 0.01

            messageStorage.set(ctx.message.message_id)
            messageStorage.reply(ctx, 'Введіть кількість RR')
            status = 'FIX2'
        } else {
            messageStorage.set(ctx.message.message_id)
            messageStorage.reply(ctx, 'Потрібно ввести цифру')
        }

        return
    }

    if (status == 'FIX2') {
        if (!Number.isNaN(Number(text))) {
            messageStorage.set(ctx.message.message_id)

            const response = await updateFixMessage(
                messageStorage.ctx.update.callback_query.message.caption_entities,
                Number(text),
                fix
            )

            messageStorage.ctx.editMessageCaption(template(response), { parse_mode: 'Markdown', ...buttons.get(['edit']) })

            messageStorage.reply(ctx, 'Фіксасія збережена')
            messageStorage.finish(ctx)

            status = null
        } else {
            messageStorage.set(ctx.message.message_id)
            messageStorage.reply(ctx, 'Потрібно ввести цифру')
        }

        return
    }

    if (status == 'RISK') {
        if (!Number.isNaN(Number(text))) {
            messageStorage.set(ctx.message.message_id)

            let response = await updateRiskMessage(
                messageStorage.ctx.update.callback_query.message.caption_entities,
                Number(text) * 0.01
            )
            messageStorage.ctx.editMessageCaption(template(response), { parse_mode: 'Markdown', ...buttons.get(['edit']) })
            messageStorage.reply(ctx, 'Ризик відредаговано')
            messageStorage.finish(ctx)

            status = null
        } else {
            messageStorage.set(ctx.message.message_id)
            messageStorage.reply(ctx, 'Потрібно ввести цифру')
        }

        return
    }

    if (status == 'RR') {
        if (!Number.isNaN(Number(text))) {
            messageStorage.set(ctx.message.message_id)

            let response = await updateRRMessage(
                messageStorage.ctx.update.callback_query.message.caption_entities,
                Number(text)
            )
            messageStorage.ctx.editMessageCaption(template(response), { parse_mode: 'Markdown', ...buttons.get(['edit']) })
            messageStorage.reply(ctx, 'RR відредаговано')
            messageStorage.finish(ctx)

            status = null
        } else {
            messageStorage.set(ctx.message.message_id)
            messageStorage.reply(ctx, 'Потрібно ввести цифри')
        }

        return
    }

    if (ctx.message.reply_to_message) {
        switch (ctx.message.text.trim()) {
            case '/delete': {
                await deleteMessage(ctx)
                return
            }
            case '/be': await updateMessageState(ctx, "BE")
            case '/t': await updateMessageState(ctx, "Target")
            case '/s': await updateMessageState(ctx, "Loss")
            default:
        }

        await ctx.deleteMessage(ctx.message.message_id)
    }
})

bot.on('callback_query', async (ctx) => {
    try {
        const { message, data } = ctx.update.callback_query;

        if (data == 'exit') {
            await ctx.editMessageReplyMarkup(buttons.getReply(['edit']))
            await messageStorage.finish(ctx)
            status = null
            return
        }

        if (data == 'edit_data') {
            ctx.editMessageReplyMarkup(buttons.getReply(['edit_state', 'edit_risk', 'edit_rr', 'edit_pair'], ['exit']))
            return
        }

        if (data == 'edit_state') {
            ctx.editMessageReplyMarkup(buttons.getReply(['target', 'stop', 'be'], ['exit']))
            return
        }

        if (data == 'edit_risk') {
            status = 'RISK'
            ctx.editMessageReplyMarkup(buttons.getReply(['cancel']))

            messageStorage.ctx = ctx
            messageStorage.reply(ctx, 'Введіть ризик в %:')

            return
        }

        if (data == 'edit_rr') {
            status = 'RR'
            ctx.editMessageReplyMarkup(buttons.getReply(['cancel']))

            messageStorage.ctx = ctx
            messageStorage.reply(ctx, 'Введіть RR:')

            return
        }

        if (data == 'fix') {
            status = 'FIX1'
            ctx.editMessageReplyMarkup(buttons.getReply(['cancel']))

            messageStorage.ctx = ctx
            messageStorage.reply(ctx, 'Введіть кількість %:')
            return
        }

        if (data == 'edit') {
            ctx.editMessageReplyMarkup(buttons.getReply(['fix', 'edit_data'], ['exit']))
        } else {
            let response = await updateStateMessage(message.caption_entities, data)
            ctx.editMessageCaption(template(response), { parse_mode: 'Markdown', ...buttons.get(['edit']) })
        }
    } catch (e) {
        console.error('Error while proccessing text: ', e.message)
    }
})

bot.on(message('photo'), async (ctx) => {
    try {
        const text = ctx.message.caption
        let [position, rr] = text.split(' ')
        position = KEYS[position]


        const { href } = await bot.telegram.getFileLink(ctx.message.photo[3].file_id)
        const response = await create({ rr, href, risk: risk.value, pair: 'EUR/USD', position})

        let msg = await ctx.replyWithPhoto(
            { url: href },
            { caption: template(response), parse_mode: 'Markdown',
            ...buttons.get(['target', 'stop', 'fix', 'be'])})
        await ctx.deleteMessage(ctx.message.message_id)
    } catch (e) {
        console.error('Error while proccessing text: ', e.message)
    }
})


bot.launch()
