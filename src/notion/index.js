import { Client } from '@notionhq/client'
import config from 'config'
import { getDataResponse } from './interface.js'
import { getReplyToMessageId } from '../methods/replyToMessageId.js'
import keys from '../message/keys.js'

export async function addRow(ctx, params) {
    const notion = await new Client({ auth: ctx.state.secretKey })
    const db = await notion.databases.query({ database_id: ctx.state.traderJournalId })

    const response = await notion.pages.create({
        parent: { database_id: ctx.state.traderJournalId },
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

async function updateRow(ctx, properties) {
    const notion = await new Client({ auth: ctx.state.secretKey })

    const response = await notion.pages.update({
        page_id: getReplyToMessageId(ctx.update.callback_query.message.caption_entities),
        properties,
    });

    return getDataResponse(response)
}

export async function removeRow(ctx) {
    const notion = await new Client({ auth: ctx.state.secretKey })

    return await notion.pages.update({
        page_id: getReplyToMessageId(ctx.update.callback_query.message.caption_entities),
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
