import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import config from 'config'
import { create, remove, updateState } from './notion.js'
// var https = require('https')

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'), {
    handlerTimeout: Infinity,
})

bot.telegram.setMyCommands([
    {
        command: 'risk',
        description: 'set risk',
    },
]);

// bot.command('start', ctx => {
//     ctx.reply('-___-')
// })
let risk = {
    state: false,
    value: 0.5,
}

bot.command('risk', ctx => {
    risk.state = true;
    let { message_id } = ctx.reply('Введіть ризик:')
})


const deleteMessage = (async (ctx) => {
    await ctx.deleteMessage(ctx.message.message_id)

    if (ctx.message.reply_to_message) {
        const { message_id } = ctx.message.reply_to_message
        await ctx.deleteMessage(message_id)

        if (!ctx.message.reply_to_message.hasOwnProperty('caption_entities'))
            return

        let itemLink = ctx.message.reply_to_message.caption_entities
            .find((item) => item.type == 'text_link')

        if (itemLink) {
            const replyToMessageId = itemLink.url.replace(/.*\//, '').replace(/.\s*-/, '');
            remove(replyToMessageId)
        }
    }
})

const updateMessageState = (async (ctx, state) => {
    //console.log('message  ', ctx.message)
    await ctx.deleteMessage(ctx.message.message_id)

    if (ctx.message.reply_to_message) {
        let itemLink = ctx.message.reply_to_message.caption_entities
            .find((item) => item.type == 'text_link')

        if (itemLink) {
            const replyToMessageId = itemLink.url.replace(/.*\//, '').replace(/.\s*-/, '');
            console.log(replyToMessageId)
            updateState(state)
        }
    }
})


bot.on(message('text'), async (ctx) => {
    if (risk.state) {
        const value = Number(ctx.message.text);
        if (!Number.isNaN(value)) {
            risk.value = value
        }

        risk.state = false;
        await ctx.deleteMessage(ctx.message.message_id)
        await ctx.deleteMessage(ctx.message.message_id - 1)
        await ctx.deleteMessage(ctx.message.message_id - 2)
        let { message_id } = await ctx.reply(`Ризик змінено на ${risk.value}%`)
        setTimeout(() => {
            ctx.deleteMessage(message_id)
        }, 1500);

        return;
    }

    if (ctx.message.text) {
        switch (ctx.message.text.trim().toUpperCase()) {
            case '/D':
                deleteMessage(ctx)
                return
            case 'BE':
                await updateMessageState(ctx, "BE")
                return
            case 'T':
                await updateMessageState(ctx, "Target")
                return
            case 'S':
                await updateMessageState(ctx, "Loss")
                return
            default:
        }

    }
})

bot.on(message('photo'), async (ctx) => {
    try {
        const text = ctx.message.caption
        let [position, rr] = text.split(' ')
        position = position == 'l' ? 'Long' : 'Short'


        const { href } = await bot.telegram.getFileLink(ctx.message.photo[3].file_id)
        const response = await create({ rr, href, risk: risk.value, pair: 'EUR/USD', position})

        console.log(response)
        let msgText = `№${response.count}\nEURUSD - *${position}*\nRR: *${rr}*\nRisk: *${risk.value}%*\n\n[посилання](${response.url})`

        let { message_id } = ctx.replyWithPhoto({ url: href }, { caption: msgText, parse_mode: 'Markdown' });
        //ctx.telegram.editMessageCaption(ctx.chat.id, message_id, 0, `tes${msgText} ${message_id}`)
        await ctx.deleteMessage(ctx.message.message_id)
    } catch (e) {
        console.error('Error while proccessing text: ', e.message)
    }
})

bot.launch()
