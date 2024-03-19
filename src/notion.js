import { Client } from '@notionhq/client'
import config from 'config'

const notion = new Client({
    auth: config.get('NOTION_KEY'),
})

function getDataResponse(data) {
    return {
        id: data.id,
        database_id: data.parent.database_id,
        url: data.url,
        title: data.properties.Name.title[0].plain_text,
        state: data.properties['State'].status.name,
        position: data.properties['Position'].select.name,
        risk: data.properties['Risk %'].number,
        rr: data.properties['Target'].number,
        pair: data.properties['Pair'].select.name,

        fix: data.properties['Fix'].number,
        fix_proc: data.properties['Fix %'].number,
        profit: data.properties['Profit'].formula.number
    }
}

export async function create({ rr, href, risk, pair, position}) {
    const databases = await notion.databases.query({ database_id: config.get('NOTION_DB_ID') })
    const count = databases.results.length + 1

    const response = await notion.pages.create({
        parent: { database_id: config.get('NOTION_DB_ID') },
        properties: {
            Name: {
                title: [
                    {
                        text: {
                            content: count + ''
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
                number: (risk*0.01),
            },
            "Pair": {
                select: {
                    name: pair,
                }
            },
            "Target": {
                number: Number(rr),
            },
            // "State": {
            //     status: {
            //         name: "Target",
            //     }
            // },
            Position: {
                select: {
                    name: position,
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
                        "url": href
                    }
                }
            }
            // {
            //     object: 'block',
            //     type: 'paragraph',
            //     paragraph: {
            //         rich_text: [
            //             {
            //                 "type": "image",
            //                 "image": {
            //                     "type": "external",
            //                     "external": {
            //                         "url": url
            //                     }
            //                 }
            //             }
            //             // {
            //             //     type: 'link_preview',
            //             //     link_preview: {
            //             //         url: url,
            //             //     },
            //             // }
            //         ]
            //     }
            //     // type: 'paragraph',
            //     // paragraph: {
            //     //     rich_text: [
            //     //         {
            //     //             type: 'text',
            //     //             text: {
            //     //                 content: title,
            //     //             }
            //     //         }
            //     //     ]
            //     //}
            // }
        ]
    })

    console.log('page ', response)

    return getDataResponse(response)
}

export async function remove(messageId) {
    const response = await notion.pages.update({page_id: messageId, archived: true});

    return { ...response }
}

export async function updateState(messageId, state) {
    const response = await notion.pages.update({
        page_id: messageId,
        properties: {
            "State": {
                status: {
                    name: state,
                }
            },
        }
    });

    return getDataResponse(response)
}

export async function updateFix(messageId, rr, proc) {
    try {
        const response = await notion.pages.update({
            page_id: messageId,
            properties: {
                "Fix": {
                    number: rr,
                },
                "Fix %": {
                    number: proc,
                },
            }
        });

        console.log('response', response.properties['Profit'])

        return getDataResponse(response)
    } catch (e) {
        console.log('Error message ', e.message)
    }
}

export async function updateRisk(messageId, value) {
    const response = await notion.pages.update({
        page_id: messageId,
        properties: {
            "Risk %": {
                number: value
            },
        }
    });

    return getDataResponse(response)
}

export async function updateRR(messageId, value) {
    const response = await notion.pages.update({
        page_id: messageId,
        properties: {
            "Target": {
                number: value
            },
        }
    });

    return getDataResponse(response)
}
