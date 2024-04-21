
function getSecretKey(response) {
    if (!response) return null

    return getPlainText(response.properties['SECRET_KEY'].rich_text)
}

function getDBID(response) {
    if (!response) return null

    return getPlainText(response.properties['DB_ID'].title)
}

export default {
    async notion(username, auth) {
        if (!auth) auth = await getSecretKey(await this.getDB(username))
        const notion = new Client({ auth })
        this.myNotion = notion

        return notion
    },
    async getDB(username) {
        const db = await nGeneral.databases.query({ database_id: config.get('NOTION_DB_ID') })
        return db.results.find((item) => item.properties.Author.rich_text[0].plain_text == username)
    },
    async createSecretKey(ctx) {
        try {
            const notion = await this.notion(username, key)
            let user = await notion.users.me({})

            await nGeneral.pages.create({
                parent: { database_id: config.get('NOTION_DB_ID') },
                properties: {
                    SECRET_KEY: {
                        rich_text: [{
                            text: { content: key }
                        }]
                    },
                    Author: {
                        rich_text: [{
                            text: { content: username }
                        }]
                    },
                    PAIRS: {
                        rich_text: [{
                            text: { content: 'EUR/USD' }
                        }]
                    }
                }
            })
        } catch (e) {
            return false
        }
    }
}
