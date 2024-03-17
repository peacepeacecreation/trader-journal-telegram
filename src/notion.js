import { Client } from '@notionhq/client'
import config from 'config'

const notion = new Client({
    auth: config.get('NOTION_KEY'),
})

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
            "State": {
                status: {
                    name: "Target",
                }
            },
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


    return { ...response, count }
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

    return { ...response }
}
