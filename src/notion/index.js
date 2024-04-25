import { Client } from '@notionhq/client'
import config from 'config'
import { getDataResponse } from './interface.js'
import { getReplyToMessageId } from '../methods/replyToMessageId.js'
import keys from '../message/keys.js'

const GENERAL_BD = new Client({ auth: config.get('NOTION_KEY') })
const findAuthor = (results, authorId) => results.find((item) => item.properties.AUTHOR_ID.rich_text[0]?.plain_text == authorId)

const authorId = (ctx) => {
    console.log(ctx)
    if (ctx?.update?.callback_query)
        return ctx.update.callback_query.from.id

    return ctx.msg.from.id
}

export async function addRow(ctx, params) {
    const notion = await new Client({ auth: ctx.session.secretKey })
    const db = await notion.databases.query({ database_id: ctx.session.traderJournalId })

    const response = await notion.pages.create({
        parent: { database_id: ctx.session.traderJournalId },
        properties: {
            Name: {
                title: [
                    {
                        text: {
                            content: (db.results.length + 1) + ''
                        },
                    }
                ]
            },
            Datetime: {
                date: {
                    start: new Date().toISOString(),
                }
            },
            "Risk %": {
                number: (params.risk*0.01),
            },
            "Pair": {
                select: {
                    name: params.pair,
                }
            },
            "Target": {
                number: Number(params.rr),
            },
            Position: {
                select: {
                    name: params.position,
                }
            }
        }
    })

    await notion.blocks.children.append({
        block_id: response.id,
        children: [
            {
                "type": "image",
                "image": {
                    "type": "external",
                    "external": {
                        "url": params.href
                    }
                }
            }
        ]
    })

    return getDataResponse(response)
}

export async function createRow(ctx, params) {
    const notion = await new Client({ auth: ctx.session.secretKey })
    const db = await notion.databases.query({ database_id: ctx.session.traderJournalId })

    const response = await notion.pages.create({
        parent: { database_id: ctx.session.traderJournalId },
        properties: {
            Name: {
                title: [
                    {
                        text: {
                            content: (db.results.length + 1) + ''
                        },
                    }
                ]
            },
            Datetime: {
                date: {
                    start: new Date().toISOString(),
                }
            },
        }
    })

    await notion.blocks.children.append({
        block_id: response.id,
        children: [
            {
                "type": "image",
                "image": {
                    "type": "external",
                    "external": {
                        "url": params.href
                    }
                }
            }
        ]
    })

    return getDataResponse(response)
}

async function updateRow(ctx, properties) {
    const notion = await new Client({ auth: ctx.session.secretKey })

    console.log(ctx)

    const response = await notion.pages.update({
        page_id: getReplyToMessageId(ctx.update.callback_query.message.caption_entities),
        properties,
    });

    return getDataResponse(response)
}

export async function removeRow(ctx) {
    const notion = await new Client({ auth: ctx.session.secretKey })

    console.log(ctx, )

    return await notion.pages.update({
        page_id: getReplyToMessageId(ctx.msg.reply_to_message.caption_entities),
        archived: true
    });
}


export async function updateState(ctx, value) {
    const data = {
        "State": {
            status: {
                name: keys.stateOptions[value],
            }
        },
    }

    return await updateRow(ctx, data)
}

export async function updateRR(ctx, value) {
    const data = {
        "Target": {
            number: value
        },
    }

    return await updateRow(ctx, data)
}

export async function updateRisk(ctx, value) {
    const data = {
        "Risk %": {
            number: value * 0.01
        },
    }

    return await updateRow(ctx, data)
}

export async function updateFix(ctx, params) {
    const data = {
        "Fix": {
            number: params.rr,
        },
        "Fix %": {
            number: params.percent * 0.01,
        },
    }

    return await updateRow(ctx, data)
}

export async function updatePair(ctx, value) {
    const data = {
        "Pair": {
            select: {
                name: value,
            }
        },
    }

    return await updateRow(ctx, data)
}



export async function updatePosition(ctx, value) {
    console.log(value)
    const data = {
        "Position": {
            select: {
                name: value,
            }
        },
    }

    return await updateRow(ctx, data)
}

export async function updatePairs(ctx, pairs) {
    const db = await GENERAL_BD.databases.query({ database_id: config.get('NOTION_DB_ID') })
    const response = await findAuthor(db.results, authorId(ctx))

    const data = await GENERAL_BD.pages.update({
        page_id: response.id,
        properties: {
            PAIRS: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: pairs.join(' ')
                        }
                    }
                ]
            }
        },
    });
}
