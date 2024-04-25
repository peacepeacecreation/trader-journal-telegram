import { Client } from '@notionhq/client'
import config from 'config'
const GENERAL_BD = new Client({ auth: config.get('NOTION_KEY') })

const findAuthor = (results, authorId) => results.find((item) => item.properties.AUTHOR_ID.rich_text[0]?.plain_text == authorId)
const field = (ctx, key = 'username') => ctx.message.from[key].toString()
const authorId = (ctx) => {
    if (ctx.update.callback_query)
        return ctx.update.callback_query.from.id

    return ctx.msg.from.id
}

const msgAuthor = async (ctx) => {
    try {
        const db = await GENERAL_BD.databases.query({ database_id: config.get('NOTION_DB_ID') })
        return findAuthor(db.results, authorId(ctx))
    } catch (e) {
        console.log('connection DB get key ', e.message)
    }
}

const USER_BD = async (ctx, secretKey) => {
    if (!secretKey) {
        const rowAuthor = await msgAuthor(ctx)
        secretKey = rowAuthor.properties.SECRET_KEY.rich_text[0].plain_text
    }

    return new Client({ auth: secretKey })
}

const getData = (data, key, type) => data?.properties[key][type][0]?.plain_text

export default {
    hasSigned: async (ctx) => {
        const author = await msgAuthor(ctx)

        if (!author) {
            ctx.scene.enter('create-secret-key')
            return false
        }

        if (getData(author, 'SECRET_KEY', 'rich_text') && !getData(author, 'DB_ID', 'title')) {
            ctx.scene.enter('create-trader-journal')
            return false
        }

        return {
            traderJournalId: getData(author, 'DB_ID', 'title'),
            secretKey: getData(author, 'SECRET_KEY', 'rich_text'),
            pairs: getData(author, 'PAIRS', 'rich_text').split(' '),
        }
    },
    async createSecretKey(ctx, value) {
        try {
            const userNotion = await USER_BD(ctx, value)
            let user = await userNotion.users.me({})

            await GENERAL_BD.pages.create({
                parent: { database_id: config.get('NOTION_DB_ID') },
                properties: {
                    SECRET_KEY: {
                        rich_text: [{
                            text: { content: value }
                        }]
                    },
                    AUTHOR: {
                        rich_text: [{
                            text: { content: field(ctx) }
                        }]
                    },
                    AUTHOR_ID: {
                        rich_text: [{
                            text: { content: field(ctx, 'id') }
                        }]
                    },
                    PAIRS: {
                        rich_text: [{
                            text: { content: 'EUR/USD' }
                        }]
                    },
                }
            })

            return { valid: true }
        } catch (e) {
            return { valid: false, errMessage: e.message }
        }
    },
    async createTraderJournal(ctx, value) {
        try {
            const userNotion = await USER_BD(ctx)
            const USER_DATA = await msgAuthor(ctx)
            const dbTraderJournal = await userNotion.databases.query({ database_id: value })

            await GENERAL_BD.pages.update({
                page_id: USER_DATA.id,
                properties: {
                    DB_ID: {
                        title: [{
                            text: { content: value }
                        }]
                    },
                }
            })

            return { valid: true }
        } catch (e) {
            return { valid: false, errMessage: e.message }
        }
    },
}
